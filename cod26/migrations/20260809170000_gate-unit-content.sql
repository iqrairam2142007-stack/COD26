-- Fix: the worked example and discussion question were added as columns on
-- public.units, which is deliberately world-readable so the marketing pages
-- can list the catalogue. RLS is row-level, not column-level, so those two
-- fields were reachable by anonymous callers for every paid unit.
--
-- They move to their own table, gated exactly like chapters. `summary` stays
-- on units on purpose: a course listing needs a description, and a short
-- teaser is the intended public preview.

CREATE TABLE IF NOT EXISTS public.unit_content (
  unit_id      INTEGER PRIMARY KEY REFERENCES public.units(id) ON DELETE CASCADE,
  code_example TEXT,
  quiz_prompt  TEXT,
  updated_at   TIMESTAMPTZ NOT NULL DEFAULT now()
);

INSERT INTO public.unit_content (unit_id, code_example, quiz_prompt)
SELECT id, code_example, quiz_prompt FROM public.units
ON CONFLICT (unit_id) DO UPDATE
  SET code_example = EXCLUDED.code_example,
      quiz_prompt  = EXCLUDED.quiz_prompt;

ALTER TABLE public.units DROP COLUMN IF EXISTS code_example;
ALTER TABLE public.units DROP COLUMN IF EXISTS quiz_prompt;

ALTER TABLE public.unit_content ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS unit_content_read ON public.unit_content;
CREATE POLICY unit_content_read ON public.unit_content
  FOR SELECT TO anon, authenticated
  USING (
    public.is_admin()
    OR public.has_course_access()
    OR public.is_free_unit(unit_id)
  );

DROP POLICY IF EXISTS unit_content_admin_write ON public.unit_content;
CREATE POLICY unit_content_admin_write ON public.unit_content
  FOR ALL TO authenticated
  USING (public.is_admin()) WITH CHECK (public.is_admin());

GRANT SELECT ON public.unit_content TO anon, authenticated;
GRANT INSERT, UPDATE, DELETE ON public.unit_content TO authenticated;
