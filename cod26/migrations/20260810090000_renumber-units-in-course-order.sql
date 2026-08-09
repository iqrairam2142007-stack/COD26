-- Unit ids ran 1-26 but the course order did not: the capstone kept id 17
-- while sitting last, and the nine newer units held ids 18-26 while sitting
-- 17th-25th. The catalogue therefore read "UNIT 16, UNIT 18, UNIT 22" with a
-- visible gap where 17 should be.
--
-- There is no student data yet (0 rows in unit_progress, chapter_progress,
-- quiz_attempts, unit_videos and resources), so the ids can be renumbered to
-- match the course order exactly. After this, id = position = the number a
-- student sees.
--
-- Mapping:  1-16 unchanged  ·  18-26 -> 17-25  ·  17 -> 26 (capstone last)

-- Foreign keys are NO ACTION on update, which would block renumbering the
-- parent. ON UPDATE CASCADE is the correct setting regardless: if a unit id
-- ever moves again, its chapters must move with it.
ALTER TABLE public.chapters         DROP CONSTRAINT IF EXISTS chapters_unit_id_fkey;
ALTER TABLE public.chapters         ADD  CONSTRAINT chapters_unit_id_fkey
  FOREIGN KEY (unit_id) REFERENCES public.units(id) ON UPDATE CASCADE ON DELETE CASCADE;

ALTER TABLE public.resources        DROP CONSTRAINT IF EXISTS resources_unit_id_fkey;
ALTER TABLE public.resources        ADD  CONSTRAINT resources_unit_id_fkey
  FOREIGN KEY (unit_id) REFERENCES public.units(id) ON UPDATE CASCADE ON DELETE CASCADE;

ALTER TABLE public.unit_content     DROP CONSTRAINT IF EXISTS unit_content_unit_id_fkey;
ALTER TABLE public.unit_content     ADD  CONSTRAINT unit_content_unit_id_fkey
  FOREIGN KEY (unit_id) REFERENCES public.units(id) ON UPDATE CASCADE ON DELETE CASCADE;

ALTER TABLE public.chapter_progress DROP CONSTRAINT IF EXISTS chapter_progress_unit_id_fkey;
ALTER TABLE public.chapter_progress ADD  CONSTRAINT chapter_progress_unit_id_fkey
  FOREIGN KEY (unit_id) REFERENCES public.units(id) ON UPDATE CASCADE ON DELETE CASCADE;

-- ------------------------------------------------------------- renumbering
-- Two phases. Parking the affected ids above 1000 first means no id is ever
-- assigned a value another row still holds.

-- Phase 1: park everything from 17 upwards.
UPDATE public.units          SET id      = id      + 1000 WHERE id      >= 17;
UPDATE public.quiz_questions SET unit_id = unit_id + 1000 WHERE unit_id >= 17;
UPDATE public.unit_videos    SET unit_id = unit_id + 1000 WHERE unit_id >= 17;

-- Phase 2: land on the final numbers. Targets 17-26 are all vacant.
UPDATE public.units          SET id      = 26            WHERE id      = 1017;
UPDATE public.units          SET id      = id      - 1001 WHERE id      BETWEEN 1018 AND 1026;
UPDATE public.quiz_questions SET unit_id = 26            WHERE unit_id = 1017;
UPDATE public.quiz_questions SET unit_id = unit_id - 1001 WHERE unit_id BETWEEN 1018 AND 1026;
UPDATE public.unit_videos    SET unit_id = 26            WHERE unit_id = 1017;
UPDATE public.unit_videos    SET unit_id = unit_id - 1001 WHERE unit_id BETWEEN 1018 AND 1026;

-- Position now matches the id for every unit.
UPDATE public.units SET position = id;

-- Keep the identity sequence ahead of the highest id so new units insert cleanly.
SELECT setval(pg_get_serial_sequence('public.units', 'id'), (SELECT MAX(id) FROM public.units));
