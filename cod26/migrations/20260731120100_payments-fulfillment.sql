-- Payment-session RLS + class-fee fulfillment.
--
-- Written against the live payments schema on this backend. Two things matter:
--
--   * Fulfillment triggers on payments.webhook_events - the verified provider
--     event ledger. NOT on success/callback URLs (a user can navigate there
--     directly, or close the browser before the redirect fires) and NOT on
--     payments.transactions (that is a reporting projection, and this role
--     cannot create triggers on it anyway).
--
--   * The billing subject is read back from the provider's own attempt table
--     (stripe_checkout_sessions / razorpay_orders). Those rows are written by
--     our checkout call before the webhook arrives, so they always exist -
--     unlike payments.customer_mappings, which is owned by a different event
--     and has no ordering guarantee.
--
-- One trigger covers Stripe and Razorpay, so the provider choice only affects
-- frontend checkout code, not the database.

-- ------------------------------------------------- checkout session RLS
-- A signed-in student may only open a checkout for themselves. SELECT is
-- required as well as INSERT: the backend inserts with ON CONFLICT DO NOTHING
-- on the idempotency key, then reads the existing attempt back under the
-- caller's context when a retry collides.

ALTER TABLE payments.stripe_checkout_sessions ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS stripe_checkout_insert_self ON payments.stripe_checkout_sessions;
CREATE POLICY stripe_checkout_insert_self ON payments.stripe_checkout_sessions
  FOR INSERT WITH CHECK (subject_type = 'user' AND subject_id = auth.uid()::text);

DROP POLICY IF EXISTS stripe_checkout_select_self ON payments.stripe_checkout_sessions;
CREATE POLICY stripe_checkout_select_self ON payments.stripe_checkout_sessions
  FOR SELECT USING (subject_type = 'user' AND subject_id = auth.uid()::text);

ALTER TABLE payments.razorpay_orders ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS razorpay_order_insert_self ON payments.razorpay_orders;
CREATE POLICY razorpay_order_insert_self ON payments.razorpay_orders
  FOR INSERT WITH CHECK (subject_type = 'user' AND subject_id = auth.uid()::text);

DROP POLICY IF EXISTS razorpay_order_select_self ON payments.razorpay_orders;
CREATE POLICY razorpay_order_select_self ON payments.razorpay_orders
  FOR SELECT USING (subject_type = 'user' AND subject_id = auth.uid()::text);

-- ------------------------------------------------------------ fulfillment
-- The idempotency anchor is the webhook event id, not a transaction id.
ALTER TABLE public.orders RENAME COLUMN payment_transaction_id TO payment_event_id;

CREATE OR REPLACE FUNCTION public.fulfill_class_fee()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  subj       TEXT;
  buyer      UUID;
  open_order UUID;
BEGIN
  IF NEW.processing_status <> 'processed' THEN
    RETURN NEW;
  END IF;

  -- Both providers re-deliver webhooks; this makes a repeat a no-op.
  IF EXISTS (SELECT 1 FROM public.orders WHERE payment_event_id = NEW.id) THEN
    RETURN NEW;
  END IF;

  IF NEW.provider = 'stripe' AND NEW.event_type = 'checkout.session.completed' THEN
    SELECT s.subject_id INTO subj
      FROM payments.stripe_checkout_sessions s
     WHERE s.checkout_session_id = NEW.object_id
       AND s.subject_type = 'user'
       AND s.mode = 'payment'
     LIMIT 1;

  ELSIF NEW.provider = 'razorpay' AND NEW.event_type IN ('order.paid', 'payment.captured') THEN
    -- order.paid carries the order id directly; payment.captured carries the
    -- payment entity, whose order_id sits in the payload.
    SELECT o.subject_id INTO subj
      FROM payments.razorpay_orders o
     WHERE o.order_id = COALESCE(
             NULLIF(NEW.payload #>> '{payload,payment,entity,order_id}', ''),
             NULLIF(NEW.payload #>> '{payload,order,entity,id}', ''),
             NEW.object_id)
       AND o.subject_type = 'user'
     LIMIT 1;

  ELSE
    RETURN NEW;
  END IF;

  IF subj IS NULL THEN
    RETURN NEW;
  END IF;

  BEGIN
    buyer := subj::UUID;
  EXCEPTION WHEN others THEN
    RETURN NEW;              -- subject_id was not a user id
  END;

  SELECT id INTO open_order
    FROM public.orders
   WHERE user_id = buyer AND status = 'pending'
   ORDER BY created_at DESC
   LIMIT 1;

  IF open_order IS NOT NULL THEN
    UPDATE public.orders
       SET status = 'paid', paid_at = now(), payment_event_id = NEW.id
     WHERE id = open_order;
  ELSE
    -- Money arrived with no pending order row. Record it anyway so the payment
    -- is not invisible, and so this event counts as fulfilled.
    INSERT INTO public.orders (user_id, amount, currency, status, paid_at, payment_event_id)
    VALUES (buyer, 0, 'INR', 'paid', now(), NEW.id);
  END IF;

  UPDATE public.profiles
     SET access_status     = 'active',
         account_type      = 'direct',
         access_expires_at = GREATEST(COALESCE(access_expires_at, now()), now()) + INTERVAL '6 months'
   WHERE id = buyer;

  RETURN NEW;
END;
$$;

DROP TRIGGER IF EXISTS on_payment_webhook ON payments.webhook_events;
CREATE TRIGGER on_payment_webhook
  AFTER INSERT OR UPDATE ON payments.webhook_events
  FOR EACH ROW EXECUTE FUNCTION public.fulfill_class_fee();
