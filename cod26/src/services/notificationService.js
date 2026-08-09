import insforge, { unwrap } from "../lib/insforge";

/**
 * A notification with a NULL user_id is a broadcast. Read state lives in a
 * separate table so one broadcast row serves every student.
 */
const notificationService = {
  async list(userId) {
    const [items, reads] = await Promise.all([
      unwrap(
        await insforge.database
          .from("notifications")
          .select("*")
          .order("created_at", { ascending: false })
          .limit(50)
      ),
      unwrap(
        await insforge.database
          .from("notification_reads")
          .select("notification_id")
          .eq("user_id", userId)
      ),
    ]);
    const seen = new Set((reads || []).map((r) => r.notification_id));
    return (items || []).map((n) => ({ ...n, read: seen.has(n.id) }));
  },

  async markRead(userId, notificationId) {
    return unwrap(
      await insforge.database
        .from("notification_reads")
        .upsert([{ user_id: userId, notification_id: notificationId }], {
          onConflict: "notification_id,user_id",
        })
    );
  },

  async markAllRead(userId, items) {
    const unread = items.filter((n) => !n.read);
    if (!unread.length) return;
    return unwrap(
      await insforge.database.from("notification_reads").upsert(
        unread.map((n) => ({ user_id: userId, notification_id: n.id })),
        { onConflict: "notification_id,user_id" }
      )
    );
  },

  // ------------------------------------------------------------ admin only
  async send({ title, body, level = "info", userId = null, createdBy }) {
    const rows = unwrap(
      await insforge.database.from("notifications").insert([
        { title, body, level, user_id: userId, created_by: createdBy },
      ]).select()
    );
    return rows[0];
  },

  async remove(id) {
    return unwrap(await insforge.database.from("notifications").delete().eq("id", id));
  },

  async sent() {
    return unwrap(
      await insforge.database
        .from("notifications")
        .select("*")
        .order("created_at", { ascending: false })
        .limit(50)
    );
  },
};

export default notificationService;
