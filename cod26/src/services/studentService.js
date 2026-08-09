import insforge, { unwrap } from "../lib/insforge";

const studentService = {
  /** totalUnits comes from the catalogue, which an admin can change. */
  async progress(userId, totalUnits = 0) {
    const rows = unwrap(
      await insforge.database.from("unit_progress").select("*").eq("user_id", userId)
    );
    const unitsCompleted = rows.filter((r) => r.completed).map((r) => r.unit_id);
    return {
      rows,
      unitsCompleted,
      totalProgress: totalUnits
        ? Math.round((unitsCompleted.length / totalUnits) * 100)
        : 0,
    };
  },

  async savePage(userId, unitId, page) {
    return unwrap(
      await insforge.database
        .from("unit_progress")
        .upsert([{ user_id: userId, unit_id: unitId, last_page: page }], {
          onConflict: "user_id,unit_id",
        })
    );
  },

  /** Questions come back WITHOUT correct answers - scoring happens server-side. */
  async startQuiz(unitId) {
    return unwrap(
      await insforge.functions.invoke("quiz", {
        body: { action: "start", unitId },
      })
    );
  },

  async submitQuiz(unitId, answers, timeTaken) {
    return unwrap(
      await insforge.functions.invoke("quiz", {
        body: { action: "submit", unitId, answers, timeTaken },
      })
    );
  },

  async leaderboard({ schoolId } = {}) {
    let q = insforge.database
      .from("leaderboard_view")
      .select("*")
      .order("percentage", { ascending: false })
      .order("time_taken", { ascending: true })
      .limit(50);
    if (schoolId) q = q.eq("school", schoolId);
    const rows = unwrap(await q);
    return { leaderboard: rows };
  },

  async logActivity(activityType, description) {
    const device = /Mobi|Android|iPhone/i.test(navigator.userAgent) ? "mobile" : "desktop";
    await insforge.database.from("activity_logs").insert([
      { activity_type: activityType, description, device_type: device },
    ]);
  },
};

export default studentService;
