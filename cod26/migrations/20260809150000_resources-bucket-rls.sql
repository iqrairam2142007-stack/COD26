-- Write access to the course-resources bucket, matching course-videos:
-- admins upload, everyone can read. The bucket is public, so direct object
-- GETs bypass RLS by design - these policies gate the write surface.

DROP POLICY IF EXISTS storage_course_resources_read ON storage.objects;
CREATE POLICY storage_course_resources_read ON storage.objects
  FOR SELECT TO authenticated, anon
  USING (bucket = 'course-resources');

DROP POLICY IF EXISTS storage_course_resources_admin_insert ON storage.objects;
CREATE POLICY storage_course_resources_admin_insert ON storage.objects
  FOR INSERT TO authenticated
  WITH CHECK (bucket = 'course-resources' AND public.is_admin());

DROP POLICY IF EXISTS storage_course_resources_admin_update ON storage.objects;
CREATE POLICY storage_course_resources_admin_update ON storage.objects
  FOR UPDATE TO authenticated
  USING      (bucket = 'course-resources' AND public.is_admin())
  WITH CHECK (bucket = 'course-resources' AND public.is_admin());

DROP POLICY IF EXISTS storage_course_resources_admin_delete ON storage.objects;
CREATE POLICY storage_course_resources_admin_delete ON storage.objects
  FOR DELETE TO authenticated
  USING (bucket = 'course-resources' AND public.is_admin());
