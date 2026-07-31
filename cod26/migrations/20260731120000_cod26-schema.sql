-- COD26 platform schema.
-- Replaces the old Firebase/Firestore backend.

-- ---------------------------------------------------------------- profiles
CREATE TABLE IF NOT EXISTS public.profiles (
  id                UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  name              TEXT,
  email             TEXT,
  phone             TEXT,
  class_level       TEXT,
  school            TEXT,
  student_id        TEXT,
  account_type      TEXT NOT NULL DEFAULT 'direct'  CHECK (account_type  IN ('direct', 'school')),
  role              TEXT NOT NULL DEFAULT 'student' CHECK (role          IN ('student', 'admin')),
  access_status     TEXT NOT NULL DEFAULT 'pending' CHECK (access_status IN ('pending', 'active', 'expired')),
  access_expires_at TIMESTAMPTZ,
  created_at        TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- Every new auth user gets a profile row automatically.
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  INSERT INTO public.profiles (id, name, email)
  VALUES (NEW.id, NEW.profile->>'name', NEW.email)
  ON CONFLICT (id) DO NOTHING;
  RETURN NEW;
END;
$$;

DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();

-- Students may edit their own contact details but never their own role or
-- access. RLS cannot restrict columns, so revert privileged columns here.
CREATE OR REPLACE FUNCTION public.protect_profile_columns()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  caller_role TEXT;
BEGIN
  SELECT role INTO caller_role FROM public.profiles WHERE id = auth.uid();
  IF caller_role IS DISTINCT FROM 'admin' THEN
    NEW.role              := OLD.role;
    NEW.access_status     := OLD.access_status;
    NEW.access_expires_at := OLD.access_expires_at;
    NEW.account_type      := OLD.account_type;
  END IF;
  RETURN NEW;
END;
$$;

DROP TRIGGER IF EXISTS profiles_protect_columns ON public.profiles;
CREATE TRIGGER profiles_protect_columns
  BEFORE UPDATE ON public.profiles
  FOR EACH ROW EXECUTE FUNCTION public.protect_profile_columns();

-- ------------------------------------------------------------ school codes
CREATE TABLE IF NOT EXISTS public.school_codes (
  code        TEXT PRIMARY KEY,
  school_name TEXT NOT NULL,
  school_id   TEXT NOT NULL,
  max_uses    INTEGER NOT NULL DEFAULT 100,
  used_count  INTEGER NOT NULL DEFAULT 0,
  is_active   BOOLEAN NOT NULL DEFAULT TRUE,
  created_at  TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- ----------------------------------------------------------- quiz question bank
-- Correct answers live here and are NEVER selectable by students.
CREATE TABLE IF NOT EXISTS public.quiz_questions (
  id             BIGSERIAL PRIMARY KEY,
  unit_id        INTEGER NOT NULL,
  question       TEXT NOT NULL,
  options        JSONB NOT NULL,
  correct_answer TEXT NOT NULL,
  explanation    TEXT
);
CREATE INDEX IF NOT EXISTS quiz_questions_unit_idx ON public.quiz_questions (unit_id);

-- ------------------------------------------------------------- quiz attempts
CREATE TABLE IF NOT EXISTS public.quiz_attempts (
  id              BIGSERIAL PRIMARY KEY,
  user_id         UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  unit_id         INTEGER NOT NULL,
  correct_answers INTEGER NOT NULL,
  total_questions INTEGER NOT NULL,
  percentage      INTEGER NOT NULL,
  passed          BOOLEAN NOT NULL,
  time_taken      INTEGER NOT NULL,
  created_at      TIMESTAMPTZ NOT NULL DEFAULT now()
);
CREATE INDEX IF NOT EXISTS quiz_attempts_user_idx ON public.quiz_attempts (user_id);
CREATE INDEX IF NOT EXISTS quiz_attempts_board_idx ON public.quiz_attempts (percentage DESC, time_taken ASC);

-- ------------------------------------------------------------ unit progress
CREATE TABLE IF NOT EXISTS public.unit_progress (
  user_id    UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  unit_id    INTEGER NOT NULL,
  last_page  INTEGER NOT NULL DEFAULT 0,
  completed  BOOLEAN NOT NULL DEFAULT FALSE,
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  PRIMARY KEY (user_id, unit_id)
);

-- ------------------------------------------------------------ activity logs
CREATE TABLE IF NOT EXISTS public.activity_logs (
  id            BIGSERIAL PRIMARY KEY,
  user_id       UUID NOT NULL DEFAULT auth.uid() REFERENCES auth.users(id) ON DELETE CASCADE,
  activity_type TEXT NOT NULL,
  description   TEXT,
  device_type   TEXT,
  created_at    TIMESTAMPTZ NOT NULL DEFAULT now()
);
CREATE INDEX IF NOT EXISTS activity_logs_user_idx ON public.activity_logs (user_id, created_at DESC);

-- ------------------------------------------------------------------ orders
CREATE TABLE IF NOT EXISTS public.orders (
  id         UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id    UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  amount     INTEGER NOT NULL,
  currency   TEXT NOT NULL DEFAULT 'INR',
  status     TEXT NOT NULL DEFAULT 'pending' CHECK (status IN ('pending', 'paid', 'failed')),
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  paid_at    TIMESTAMPTZ,
  -- Set by the fulfillment trigger. UNIQUE makes re-delivered webhooks a no-op.
  payment_transaction_id UUID UNIQUE
);
CREATE INDEX IF NOT EXISTS orders_user_idx ON public.orders (user_id, created_at DESC);

-- ------------------------------------------------------------- leaderboard
-- Best attempt per (student, unit). Intentionally definer-rights so the board
-- can show other students' scores while quiz_attempts stays owner-only.
CREATE OR REPLACE VIEW public.leaderboard_view AS
SELECT DISTINCT ON (a.user_id, a.unit_id)
  a.id,
  a.user_id,
  a.unit_id,
  a.percentage,
  a.time_taken,
  a.created_at,
  p.name   AS student_name,
  p.school AS school
FROM public.quiz_attempts a
JOIN public.profiles p ON p.id = a.user_id
ORDER BY a.user_id, a.unit_id, a.percentage DESC, a.time_taken ASC;

-- --------------------------------------------------------------------- RLS
ALTER TABLE public.profiles       ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.school_codes   ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.quiz_questions ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.quiz_attempts  ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.unit_progress  ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.activity_logs  ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.orders         ENABLE ROW LEVEL SECURITY;

-- Admin check without recursing back through profiles' own policies.
CREATE OR REPLACE FUNCTION public.is_admin()
RETURNS BOOLEAN
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT EXISTS (SELECT 1 FROM public.profiles WHERE id = auth.uid() AND role = 'admin');
$$;

DROP POLICY IF EXISTS profiles_select_own ON public.profiles;
CREATE POLICY profiles_select_own ON public.profiles
  FOR SELECT USING (id = auth.uid() OR public.is_admin());

DROP POLICY IF EXISTS profiles_update_own ON public.profiles;
CREATE POLICY profiles_update_own ON public.profiles
  FOR UPDATE USING (id = auth.uid() OR public.is_admin());

-- School codes are validated by the `school-code` edge function, not read
-- directly by the browser.
DROP POLICY IF EXISTS school_codes_admin ON public.school_codes;
CREATE POLICY school_codes_admin ON public.school_codes
  FOR ALL USING (public.is_admin());

-- No student-facing policy at all: the question bank (with answers) is only
-- reachable from the `quiz` edge function running with admin credentials.
DROP POLICY IF EXISTS quiz_questions_admin ON public.quiz_questions;
CREATE POLICY quiz_questions_admin ON public.quiz_questions
  FOR SELECT USING (public.is_admin());

DROP POLICY IF EXISTS quiz_attempts_own ON public.quiz_attempts;
CREATE POLICY quiz_attempts_own ON public.quiz_attempts
  FOR SELECT USING (user_id = auth.uid() OR public.is_admin());

DROP POLICY IF EXISTS unit_progress_own ON public.unit_progress;
CREATE POLICY unit_progress_own ON public.unit_progress
  FOR ALL USING (user_id = auth.uid() OR public.is_admin())
  WITH CHECK (user_id = auth.uid());

DROP POLICY IF EXISTS activity_logs_insert_own ON public.activity_logs;
CREATE POLICY activity_logs_insert_own ON public.activity_logs
  FOR INSERT WITH CHECK (user_id = auth.uid());

DROP POLICY IF EXISTS activity_logs_select_own ON public.activity_logs;
CREATE POLICY activity_logs_select_own ON public.activity_logs
  FOR SELECT USING (user_id = auth.uid() OR public.is_admin());

DROP POLICY IF EXISTS orders_own ON public.orders;
CREATE POLICY orders_own ON public.orders
  FOR SELECT USING (user_id = auth.uid() OR public.is_admin());

DROP POLICY IF EXISTS orders_insert_own ON public.orders;
CREATE POLICY orders_insert_own ON public.orders
  FOR INSERT WITH CHECK (user_id = auth.uid() AND status = 'pending');

GRANT SELECT ON public.leaderboard_view TO authenticated;
