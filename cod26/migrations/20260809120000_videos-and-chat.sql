-- Unit videos (admin-uploaded) and AI chatbot history.

-- ------------------------------------------------------------------ helpers

-- The free sample unit. Mirrored in src/config/access.js and
-- functions/quiz.ts - change all three together.
CREATE OR REPLACE FUNCTION public.is_free_unit(p_unit_id INTEGER)
RETURNS BOOLEAN
LANGUAGE sql
IMMUTABLE
AS $$ SELECT p_unit_id = 1 $$;

-- Does the caller currently hold paid/school access?
CREATE OR REPLACE FUNCTION public.has_course_access()
RETURNS BOOLEAN
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT EXISTS (
    SELECT 1 FROM public.profiles
    WHERE id = auth.uid()
      AND access_status = 'active'
      AND (access_expires_at IS NULL OR access_expires_at > now())
  );
$$;

-- ------------------------------------------------------------- unit videos
CREATE TABLE IF NOT EXISTS public.unit_videos (
  id           UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  unit_id      INTEGER NOT NULL CHECK (unit_id BETWEEN 1 AND 17),
  title        TEXT NOT NULL,
  url          TEXT NOT NULL,
  storage_key  TEXT NOT NULL,
  mime_type    TEXT,
  size_bytes   BIGINT,
  position     INTEGER NOT NULL DEFAULT 0,
  uploaded_by  UUID REFERENCES auth.users(id) ON DELETE SET NULL,
  created_at   TIMESTAMPTZ NOT NULL DEFAULT now()
);
CREATE INDEX IF NOT EXISTS unit_videos_unit_idx
  ON public.unit_videos (unit_id, position, created_at);

ALTER TABLE public.unit_videos ENABLE ROW LEVEL SECURITY;

-- Readable when the unit is free (so signed-out visitors get the Unit 1
-- video) or the caller has paid.
DROP POLICY IF EXISTS unit_videos_read ON public.unit_videos;
CREATE POLICY unit_videos_read ON public.unit_videos
  FOR SELECT TO authenticated, anon
  USING (
    public.is_free_unit(unit_id)
    OR public.has_course_access()
    OR public.is_admin()
  );

-- Only admins add, edit or remove course videos.
DROP POLICY IF EXISTS unit_videos_admin_write ON public.unit_videos;
CREATE POLICY unit_videos_admin_write ON public.unit_videos
  FOR ALL TO authenticated
  USING (public.is_admin())
  WITH CHECK (public.is_admin());

GRANT SELECT ON public.unit_videos TO anon, authenticated;
GRANT INSERT, UPDATE, DELETE ON public.unit_videos TO authenticated;

-- ----------------------------------------------------------- chat messages
CREATE TABLE IF NOT EXISTS public.chat_messages (
  id                BIGSERIAL PRIMARY KEY,
  user_id           UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  role              TEXT NOT NULL CHECK (role IN ('user', 'assistant')),
  content           TEXT NOT NULL,
  model             TEXT,
  prompt_tokens     INTEGER,
  completion_tokens INTEGER,
  created_at        TIMESTAMPTZ NOT NULL DEFAULT now()
);
CREATE INDEX IF NOT EXISTS chat_messages_user_idx
  ON public.chat_messages (user_id, created_at);

ALTER TABLE public.chat_messages ENABLE ROW LEVEL SECURITY;

-- Students read their own history. Rows are written by the `chat` edge
-- function with admin credentials, so there is no client INSERT policy -
-- a student cannot forge an assistant message.
DROP POLICY IF EXISTS chat_messages_own ON public.chat_messages;
CREATE POLICY chat_messages_own ON public.chat_messages
  FOR SELECT TO authenticated
  USING (user_id = auth.uid() OR public.is_admin());

GRANT SELECT ON public.chat_messages TO authenticated;

-- --------------------------------------------------------- storage policies
-- The course-videos bucket is public, so direct object GETs bypass RLS by
-- design (needed for <video> streaming and seeking). These policies gate the
-- write surface and metadata listing.
ALTER TABLE storage.objects ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS storage_course_videos_read ON storage.objects;
CREATE POLICY storage_course_videos_read ON storage.objects
  FOR SELECT TO authenticated, anon
  USING (bucket = 'course-videos');

DROP POLICY IF EXISTS storage_course_videos_admin_insert ON storage.objects;
CREATE POLICY storage_course_videos_admin_insert ON storage.objects
  FOR INSERT TO authenticated
  WITH CHECK (bucket = 'course-videos' AND public.is_admin());

DROP POLICY IF EXISTS storage_course_videos_admin_update ON storage.objects;
CREATE POLICY storage_course_videos_admin_update ON storage.objects
  FOR UPDATE TO authenticated
  USING      (bucket = 'course-videos' AND public.is_admin())
  WITH CHECK (bucket = 'course-videos' AND public.is_admin());

DROP POLICY IF EXISTS storage_course_videos_admin_delete ON storage.objects;
CREATE POLICY storage_course_videos_admin_delete ON storage.objects
  FOR DELETE TO authenticated
  USING (bucket = 'course-videos' AND public.is_admin());

GRANT USAGE ON SCHEMA storage TO anon, authenticated;
GRANT SELECT ON storage.objects TO anon, authenticated;
GRANT INSERT, UPDATE, DELETE ON storage.objects TO authenticated;
