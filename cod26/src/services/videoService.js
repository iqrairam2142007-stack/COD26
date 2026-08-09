import insforge, { unwrap } from "../lib/insforge";

const BUCKET = "course-videos";

export const ACCEPTED_TYPES = ["video/mp4", "video/webm"];
export const MAX_BYTES = 100 * 1024 * 1024; // 100 MB

export function formatBytes(n) {
  if (!n) return "";
  const mb = n / (1024 * 1024);
  return mb >= 1 ? mb.toFixed(1) + " MB" : Math.round(n / 1024) + " KB";
}

/** Same checks the UI shows and the upload path enforces. */
export function validateFile(file) {
  if (!file) return "Choose a video file first.";
  const okType =
    ACCEPTED_TYPES.includes(file.type) || /\.(mp4|webm)$/i.test(file.name);
  if (!okType) return "Only MP4 and WebM videos are supported.";
  if (file.size > MAX_BYTES) {
    return `That file is ${formatBytes(file.size)}. The limit is 100 MB.`;
  }
  return null;
}

const videoService = {
  /** Videos for one unit. RLS hides paid units from users without access. */
  async forUnit(unitId) {
    return unwrap(
      await insforge.database
        .from("unit_videos")
        .select("*")
        .eq("unit_id", Number(unitId))
        .order("position", { ascending: true })
        .order("created_at", { ascending: true })
    );
  },

  async all() {
    return unwrap(
      await insforge.database
        .from("unit_videos")
        .select("*")
        .order("unit_id", { ascending: true })
        .order("position", { ascending: true })
    );
  },

  /**
   * Admin-only. Storage RLS rejects the upload for anybody else, and the
   * unit_videos insert policy rejects the row.
   */
  async upload({ unitId, title, file, userId }) {
    const problem = validateFile(file);
    if (problem) throw new Error(problem);

    const safe = file.name.replace(/[^\w.-]+/g, "-").toLowerCase();
    const key = `unit-${Number(unitId)}/${Date.now()}-${safe}`;

    const uploaded = unwrap(await insforge.storage.from(BUCKET).upload(key, file));

    try {
      const rows = unwrap(
        await insforge.database.from("unit_videos").insert([
          {
            unit_id: Number(unitId),
            title: title?.trim() || file.name,
            // Both are kept: url to play, storage_key to delete later.
            url: uploaded.url,
            storage_key: uploaded.key,
            mime_type: file.type || null,
            size_bytes: file.size,
            uploaded_by: userId ?? null,
          },
        ]).select()
      );
      return rows[0];
    } catch (e) {
      // Don't leave an orphaned object in the bucket if the row insert fails.
      await insforge.storage.from(BUCKET).remove(uploaded.key).catch(() => {});
      throw e;
    }
  },

  async remove(video) {
    unwrap(await insforge.database.from("unit_videos").delete().eq("id", video.id));
    // Best-effort: the row is already gone, so a failed object delete only
    // leaves a stray file rather than a broken listing.
    await insforge.storage.from(BUCKET).remove(video.storage_key).catch(() => {});
  },
};

export default videoService;
