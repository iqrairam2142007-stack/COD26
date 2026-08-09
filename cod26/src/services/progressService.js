import insforge, { unwrap } from "../lib/insforge";

/**
 * Two levels of progress:
 *   chapter_progress - one row per chapter a student has finished reading
 *   unit_progress    - completed set by the quiz edge function on a pass
 *
 * Chapter completion is what drives the reading progress bar; unit
 * completion still means "passed the quiz".
 */
const progressService = {
  async chapters(userId) {
    const rows = unwrap(
      await insforge.database
        .from("chapter_progress")
        .select("chapter_id, unit_id, completed_at")
        .eq("user_id", userId)
    );
    const byUnit = {};
    (rows || []).forEach((r) => {
      (byUnit[r.unit_id] = byUnit[r.unit_id] || []).push(r.chapter_id);
    });
    return {
      rows: rows || [],
      done: new Set((rows || []).map((r) => r.chapter_id)),
      byUnit,
      total: (rows || []).length,
    };
  },

  async completeChapter(userId, chapter) {
    return unwrap(
      await insforge.database.from("chapter_progress").upsert(
        [{ user_id: userId, chapter_id: chapter.id, unit_id: chapter.unit_id }],
        { onConflict: "user_id,chapter_id" }
      )
    );
  },

  async uncompleteChapter(userId, chapterId) {
    return unwrap(
      await insforge.database
        .from("chapter_progress")
        .delete()
        .eq("user_id", userId)
        .eq("chapter_id", chapterId)
    );
  },
};

export default progressService;
