import insforge, { unwrap } from "../lib/insforge";

const BUCKET = "course-resources";

export const MAX_BYTES = 25 * 1024 * 1024; // 25 MB - notes, not videos

export function formatBytes(n) {
  if (!n) return "";
  const mb = n / (1024 * 1024);
  return mb >= 1 ? mb.toFixed(1) + " MB" : Math.round(n / 1024) + " KB";
}

export function validateFile(file) {
  if (!file) return "Choose a file first.";
  if (file.size > MAX_BYTES) {
    return `That file is ${formatBytes(file.size)}. The limit is 25 MB.`;
  }
  return null;
}

/** Best-effort icon from the extension, purely cosmetic. */
export function iconFor(resource) {
  if (resource.kind === "link") return "🔗";
  const name = (resource.storage_key || resource.url || "").toLowerCase();
  if (name.endsWith(".pdf")) return "📕";
  if (/\.(png|jpe?g|gif|webp|svg)$/.test(name)) return "🖼️";
  if (/\.(zip|rar|7z)$/.test(name)) return "🗜️";
  if (/\.(py|js|ipynb|txt|md|csv)$/.test(name)) return "📄";
  return "📎";
}

const resourceService = {
  async forUnit(unitId) {
    return unwrap(
      await insforge.database
        .from("resources")
        .select("*")
        .eq("unit_id", Number(unitId))
        .order("position", { ascending: true })
        .order("created_at", { ascending: true })
    );
  },

  async all() {
    return unwrap(
      await insforge.database
        .from("resources")
        .select("*")
        .order("unit_id", { ascending: true })
        .order("position", { ascending: true })
    );
  },

  // ------------------------------------------------------------ admin only
  async addLink({ unitId, title, description, url, userId }) {
    if (!/^https?:\/\//i.test(url)) throw new Error("Links must start with http:// or https://");
    const rows = unwrap(
      await insforge.database.from("resources").insert([
        { unit_id: Number(unitId), title: title.trim(), description: description?.trim() || null,
          kind: "link", url: url.trim(), created_by: userId ?? null },
      ]).select()
    );
    return rows[0];
  },

  async upload({ unitId, title, description, file, userId }) {
    const problem = validateFile(file);
    if (problem) throw new Error(problem);

    const safe = file.name.replace(/[^\w.-]+/g, "-").toLowerCase();
    const key = `unit-${Number(unitId)}/${Date.now()}-${safe}`;
    const uploaded = unwrap(await insforge.storage.from(BUCKET).upload(key, file));

    try {
      const rows = unwrap(
        await insforge.database.from("resources").insert([
          {
            unit_id: Number(unitId),
            title: title?.trim() || file.name,
            description: description?.trim() || null,
            kind: "file",
            url: uploaded.url,
            storage_key: uploaded.key,
            mime_type: file.type || null,
            size_bytes: file.size,
            created_by: userId ?? null,
          },
        ]).select()
      );
      return rows[0];
    } catch (e) {
      // Don't strand the object in the bucket if the row insert fails.
      await insforge.storage.from(BUCKET).remove(uploaded.key).catch(() => {});
      throw e;
    }
  },

  async remove(resource) {
    unwrap(await insforge.database.from("resources").delete().eq("id", resource.id));
    if (resource.storage_key) {
      await insforge.storage.from(BUCKET).remove(resource.storage_key).catch(() => {});
    }
  },
};

export default resourceService;
