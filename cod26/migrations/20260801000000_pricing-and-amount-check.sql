-- The class fee, and the check that the student actually paid it.
--
-- Razorpay one-time orders carry the amount in the request body, sent by the
-- browser. RLS on payments.razorpay_orders only proves who the buyer is, not
-- what they were charged - so a crafted request could create a ₹1 order, pay
-- it, and trigger fulfillment. This migration makes the server verify the
-- amount before granting anything.

CREATE TABLE IF NOT EXISTS public.pricing (
  id            TEXT PRIMARY KEY,
  amount_minor  INTEGER NOT NULL,          -- paise for INR
  currency      TEXT NOT NULL DEFAULT 'INR',
  access_months INTEGER NOT NULL DEFAULT 6,
  updated_at    TIMESTAMPTZ NOT NULL DEFAULT now()
);

INSERT INTO public.pricing (id, amount_minor, currency, access_months)
VALUES ('class_fee', 50000, 'INR', 6)
ON CONFLICT (id) DO NOTHING;

ALTER TABLE public.pricing ENABLE ROW LEVEL SECURITY;

-- Students read the price to render the checkout screen; only admins change it.
DROP POLICY IF EXISTS pricing_read ON public.pricing;
CREATE POLICY pricing_read ON public.pricing
  FOR SELECT USING (auth.uid() IS NOT NULL);

DROP POLICY IF EXISTS pricing_admin_write ON public.pricing;
CREATE POLICY pricing_admin_write ON public.pricing
  FOR ALL USING (public.is_admin()) WITH CHECK (public.is_admin());

-- ------------------------------------------------------------ fulfillment
CREATE OR REPLACE FUNCTION public.fulfill_class_fee()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  subj        TEXT;
  buyer       UUID;
  open_order  UUID;
  paid_minor  BIGINT;
  paid_ccy    TEXT;
  fee         public.pricing%ROWTYPE;
BEGIN
  IF NEW.processing_status <> 'processed' THEN
    RETURN NEW;
  END IF;

  -- Both providers re-deliver webhooks; this makes a repeat a no-op.
  IF EXISTS (SELECT 1 FROM public.orders WHERE payment_event_id = NEW.id) THEN
    RETURN NEW;
  END IF;

  SELECT * INTO fee FROM public.pricing WHERE id = 'class_fee';
  IF fee.id IS NULL THEN
    RETURN NEW;                      -- no price configured; grant nothing
  END IF;

  IF NEW.provider = 'stripe' AND NEW.event_type = 'checkout.session.completed' THEN
    SELECT s.subject_id INTO subj
      FROM payments.stripe_checkout_sessions s
     WHERE s.checkout_session_id = NEW.object_id
       AND s.subject_type = 'user'
       AND s.mode = 'payment'
     LIMIT 1;
    -- Stripe amounts come from a server-side Price, so there is nothing the
    -- browser could have tampered with.
    paid_minor := fee.amount_minor;
    paid_ccy   := fee.currency;

  ELSIF NEW.provider = 'razorpay' AND NEW.event_type IN ('order.paid', 'payment.captured') THEN
    SELECT o.subject_id, o.amount_paid, o.currency
      INTO subj, paid_minor, paid_ccy
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

  -- The actual guard: underpaid or wrong-currency orders grant nothing.
  IF COALESCE(paid_minor, 0) < fee.amount_minor
     OR UPPER(COALESCE(paid_ccy, '')) <> UPPER(fee.currency) THEN
    RETURN NEW;
  END IF;

  BEGIN
    buyer := subj::UUID;
  EXCEPTION WHEN others THEN
    RETURN NEW;                      -- subject_id was not a user id
  END;

  SELECT id INTO open_order
    FROM public.orders
   WHERE user_id = buyer AND status = 'pending'
   ORDER BY created_at DESC
   LIMIT 1;

  IF open_order IS NOT NULL THEN
    UPDATE public.orders
       SET status = 'paid', paid_at = now(), payment_event_id = NEW.id,
           amount = (paid_minor / 100)::INTEGER
     WHERE id = open_order;
  ELSE
    INSERT INTO public.orders (user_id, amount, currency, status, paid_at, payment_event_id)
    VALUES (buyer, (paid_minor / 100)::INTEGER, UPPER(paid_ccy), 'paid', now(), NEW.id);
  END IF;

  UPDATE public.profiles
     SET access_status     = 'active',
         account_type      = 'direct',
         access_expires_at = GREATEST(COALESCE(access_expires_at, now()), now())
                             + (fee.access_months || ' months')::INTERVAL
   WHERE id = buyer;

  RETURN NEW;
END;
$$;
