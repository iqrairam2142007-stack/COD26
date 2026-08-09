import insforge, { unwrap } from "../lib/insforge";

/**
 * Units and chapters now live in the database so an admin can edit them.
 * Unit rows are catalogue data and readable by everyone; chapter *content*
 * is gated by RLS, so a locked unit simply returns no chapters.
 */
const contentService = {
  async units() {
    return unwrap(
      await insforge.database
        .from("units")
        .select("*")
        .order("position", { ascending: true })
        .order("id", { ascending: true })
    );
  },

  async chapters(unitId) {
    return unwrap(
      await insforge.database
        .from("chapters")
        .select("*")
        .eq("unit_id", Number(unitId))
        .order("position", { ascending: true })
    );
  },

  /**
   * Worked example and discussion question. These live apart from the unit
   * row because `units` is world-readable for the public catalogue, and RLS
   * cannot hide individual columns. Returns null when the unit is locked.
   */
  async unitContent(unitId) {
    const rows = unwrap(
      await insforge.database
        .from("unit_content")
        .select("*")
        .eq("unit_id", Number(unitId))
        .limit(1)
    );
    return rows?.[0] ?? null;
  },

  async saveUnitContent(unitId, { code_example, quiz_prompt }) {
    return unwrap(
      await insforge.database.from("unit_content").upsert(
        [{ unit_id: Number(unitId), code_example, quiz_prompt,
           updated_at: new Date().toISOString() }],
        { onConflict: "unit_id" }
      )
    );
  },

  // ------------------------------------------------------------ admin only
  async createUnit(fields) {
    const rows = unwrap(await insforge.database.from("units").insert([fields]).select());
    return rows[0];
  },

  async updateUnit(id, fields) {
    return unwrap(
      await insforge.database
        .from("units")
        .update({ ...fields, updated_at: new Date().toISOString() })
        .eq("id", Number(id))
    );
  },

  async deleteUnit(id) {
    // Chapters and resources cascade with the unit.
    return unwrap(await insforge.database.from("units").delete().eq("id", Number(id)));
  },

  async createChapter(unitId, fields) {
    const existing = await this.chapters(unitId);
    const position = fields.position ?? existing.length + 1;
    const rows = unwrap(
      await insforge.database
        .from("chapters")
        .insert([{ unit_id: Number(unitId), position, ...fields }])
        .select()
    );
    return rows[0];
  },

  async updateChapter(id, fields) {
    return unwrap(
      await insforge.database
        .from("chapters")
        .update({ ...fields, updated_at: new Date().toISOString() })
        .eq("id", id)
    );
  },

  async deleteChapter(id) {
    return unwrap(await insforge.database.from("chapters").delete().eq("id", id));
  },
};

export default contentService;
