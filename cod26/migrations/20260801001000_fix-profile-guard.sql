-- Fix: profiles_protect_columns was reverting privileged columns on EVERY
-- update path, not just end-user ones.
--
-- The guard read auth.uid() to decide whether the caller is an admin. On any
-- trusted server path - the CLI, an edge function using the admin client, or
-- the payment fulfillment trigger - there is no end-user JWT, so auth.uid()
-- is NULL, caller_role came back NULL, and `NULL IS DISTINCT FROM 'admin'`
-- evaluated TRUE. Every such update was silently reverted.
--
-- That broke all three ways a student can gain access:
--   * payment fulfillment  (fulfill_class_fee sets access_status)
--   * school code redemption (school-code edge function sets access_status)
--   * making the first admin (db query sets role)
--
-- None of them errored. They just did nothing.
--
-- Correct rule: this trigger exists to stop a signed-in student escalating
-- their own row. When auth.uid() IS NULL there is no student to guard against,
-- and RLS has already gated who may reach the row at all - the profiles UPDATE
-- policy requires `id = auth.uid()`, which no anonymous caller can satisfy.

CREATE OR REPLACE FUNCTION public.protect_profile_columns()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  caller      UUID := auth.uid();
  caller_role TEXT;
BEGIN
  -- Trusted server path (CLI / admin client / SECURITY DEFINER trigger).
  IF caller IS NULL THEN
    RETURN NEW;
  END IF;

  SELECT role INTO caller_role FROM public.profiles WHERE id = caller;

  IF caller_role IS DISTINCT FROM 'admin' THEN
    NEW.role              := OLD.role;
    NEW.access_status     := OLD.access_status;
    NEW.access_expires_at := OLD.access_expires_at;
    NEW.account_type      := OLD.account_type;
  END IF;

  RETURN NEW;
END;
$$;
