import insforge, { unwrap } from "../lib/insforge";

const DAY_MS = 86400000;
const iso = (d) => d.toISOString().slice(0, 10);

/** Consecutive days ending today (or yesterday - today may not be logged yet). */
export function streakFrom(days) {
  const set = new Set(days);
  const today = new Date();
  let cursor = set.has(iso(today))
    ? today
    : new Date(today.getTime() - DAY_MS);
  if (!set.has(iso(cursor))) return 0;

  let streak = 0;
  while (set.has(iso(cursor))) {
    streak++;
    cursor = new Date(cursor.getTime() - DAY_MS);
  }
  return streak;
}

const attendanceService = {
  /** Idempotent per day - the RPC upserts, so calling it on every load is fine. */
  async mark() {
    try {
      await insforge.database.rpc("mark_attendance");
    } catch {
      /* attendance is telemetry; never let it break the dashboard */
    }
  },

  async mine(userId, { days = 120 } = {}) {
    const since = iso(new Date(Date.now() - days * DAY_MS));
    const rows = unwrap(
      await insforge.database
        .from("attendance")
        .select("*")
        .eq("user_id", userId)
        .gte("day", since)
        .order("day", { ascending: false })
    );
    const list = (rows || []).map((r) => r.day.slice(0, 10));
    return {
      rows: rows || [],
      days: list,
      totalDays: list.length,
      streak: streakFrom(list),
    };
  },

  /** Admin: who studied, and when. */
  async report({ days = 30 } = {}) {
    const since = iso(new Date(Date.now() - days * DAY_MS));
    const rows = unwrap(
      await insforge.database
        .from("attendance")
        .select("*")
        .gte("day", since)
        .order("day", { ascending: false })
    );
    const byDay = {};
    const byUser = {};
    (rows || []).forEach((r) => {
      const d = r.day.slice(0, 10);
      byDay[d] = (byDay[d] || 0) + 1;
      byUser[r.user_id] = (byUser[r.user_id] || 0) + 1;
    });
    return { rows: rows || [], byDay, byUser, activeStudents: Object.keys(byUser).length };
  },
};

export default attendanceService;
