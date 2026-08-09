import React, { useState, useEffect, useCallback } from "react";
import { useContent } from "../../context/ContentContext";
import contentService from "../../services/contentService";

const LEVELS = ["Beginner", "Intermediate", "Advanced"];

const BLANK_UNIT = {
  title: "",
  difficulty: "Beginner",
  duration: "4 hours",
  is_free: false,
  is_published: true,
  assignment_title: "",
  assignment_deadline_days: 10,
  assignment_points: 10,
  code_example: "",
  quiz_prompt: "",
};

export default function ContentManager() {
  const { units, reload, loading } = useContent();
  const [editing, setEditing] = useState(null);   // unit row or BLANK_UNIT
  const [openUnit, setOpenUnit] = useState(null); // unit whose chapters are shown
  const [err, setErr] = useState("");
  const [notice, setNotice] = useState("");
  const [busy, setBusy] = useState(false);

  async function run(fn, message) {
    setErr("");
    setNotice("");
    setBusy(true);
    try {
      await fn();
      await reload();
      if (message) setNotice(message);
    } catch (e) {
      setErr(e.message);
    } finally {
      setBusy(false);
    }
  }

  async function saveUnit(draft) {
    const fields = {
      title: draft.title.trim(),
      difficulty: draft.difficulty,
      duration: draft.duration?.trim() || null,
      is_free: !!draft.is_free,
      is_published: !!draft.is_published,
      assignment_title: draft.assignment_title?.trim() || null,
      assignment_deadline_days: Number(draft.assignment_deadline_days) || null,
      assignment_points: Number(draft.assignment_points) || null,
    };
    if (!fields.title) throw new Error("A unit needs a title.");

    let unitId = draft.id;
    if (unitId) {
      await contentService.updateUnit(unitId, fields);
    } else {
      const created = await contentService.createUnit({ ...fields, position: units.length + 1 });
      unitId = created.id;
    }
    // Worked example and discussion question live in a paywalled table, so
    // they are saved separately from the catalogue row.
    await contentService.saveUnitContent(unitId, {
      code_example: draft.code_example?.trim() || null,
      quiz_prompt: draft.quiz_prompt?.trim() || null,
    });
    setEditing(null);
  }

  /** Editing needs the gated fields too, which are not on the unit row. */
  async function openEditor(unit) {
    setErr("");
    try {
      const extra = await contentService.unitContent(unit.id);
      setEditing({
        ...unit,
        code_example: extra?.code_example || "",
        quiz_prompt: extra?.quiz_prompt || "",
      });
    } catch (e) {
      setErr(e.message);
    }
  }

  async function removeUnit(unit) {
    const ok = window.confirm(
      `Delete Unit ${unit.id} "${unit.title}"?\n\nIts chapters, videos and resources go with it. This cannot be undone.`
    );
    if (!ok) return;
    await run(() => contentService.deleteUnit(unit.id), "Unit deleted.");
    if (openUnit?.id === unit.id) setOpenUnit(null);
  }

  async function move(unit, delta) {
    const ordered = [...units].sort((a, b) => a.position - b.position);
    const i = ordered.findIndex((u) => u.id === unit.id);
    const j = i + delta;
    if (j < 0 || j >= ordered.length) return;
    const other = ordered[j];
    await run(async () => {
      await contentService.updateUnit(unit.id, { position: other.position });
      await contentService.updateUnit(other.id, { position: unit.position });
    });
  }

  if (loading) return <div className="loading">Loading course…</div>;

  return (
    <>
      <h2 className="page-title">📘 Units &amp; chapters</h2>
      <p className="page-sub">
        This is the live course. Edits show up for students immediately — no redeploy.
      </p>

      {err && <div className="error">{err}</div>}
      {notice && <div className="notice">{notice}</div>}

      <button className="btn btn-primary" style={{ marginBottom: 18 }}
        onClick={() => setEditing({ ...BLANK_UNIT })}>
        + New unit
      </button>

      {editing && (
        <UnitForm draft={editing} busy={busy}
          onChange={setEditing}
          onCancel={() => setEditing(null)}
          onSave={() => run(() => saveUnit(editing), "Unit saved.")} />
      )}

      {units.length === 0 && <div className="notice">No units yet. Add the first one.</div>}

      {units.map((u, i) => (
        <div key={u.id} className="admin-row">
          <div className="admin-row-main">
            <div className="admin-row-title">
              <strong>Unit {u.id}: {u.title}</strong>
              {u.is_free && <span className="badge-free">FREE</span>}
              {!u.is_published && <span className="tag tag-grey">draft</span>}
            </div>
            <div className="page-sub" style={{ fontSize: ".85rem" }}>
              {u.duration} · {u.difficulty}
              {u.assignment_title ? ` · assignment: ${u.assignment_title}` : ""}
            </div>
          </div>
          <div className="admin-row-actions">
            <button className="btn btn-ghost btn-sm" disabled={busy || i === 0}
              onClick={() => move(u, -1)} aria-label="Move up">↑</button>
            <button className="btn btn-ghost btn-sm" disabled={busy || i === units.length - 1}
              onClick={() => move(u, 1)} aria-label="Move down">↓</button>
            <button className="btn btn-ghost btn-sm"
              onClick={() => setOpenUnit(openUnit?.id === u.id ? null : u)}>
              {openUnit?.id === u.id ? "Hide chapters" : "Chapters"}
            </button>
            <button className="btn btn-ghost btn-sm" onClick={() => openEditor(u)}>Edit</button>
            <button className="btn btn-ghost btn-sm" onClick={() => removeUnit(u)}>Delete</button>
          </div>

          {openUnit?.id === u.id && <ChapterEditor unit={u} />}
        </div>
      ))}
    </>
  );
}

function UnitForm({ draft, onChange, onSave, onCancel, busy }) {
  const set = (k) => (e) =>
    onChange({ ...draft, [k]: e.target.type === "checkbox" ? e.target.checked : e.target.value });

  return (
    <div className="card" style={{ marginBottom: 20 }}>
      <h3 style={{ fontSize: "1.05rem" }}>{draft.id ? `Edit unit ${draft.id}` : "New unit"}</h3>
      <div className="upload-row">
        <div className="field" style={{ flex: 2, minWidth: 220 }}>
          <label htmlFor="u-title">Title</label>
          <input id="u-title" value={draft.title} onChange={set("title")}
            placeholder="e.g. Dictionaries in depth" />
        </div>
        <div className="field" style={{ minWidth: 150 }}>
          <label htmlFor="u-diff">Difficulty</label>
          <select id="u-diff" value={draft.difficulty} onChange={set("difficulty")}>
            {LEVELS.map((l) => <option key={l}>{l}</option>)}
          </select>
        </div>
        <div className="field" style={{ minWidth: 130 }}>
          <label htmlFor="u-dur">Duration</label>
          <input id="u-dur" value={draft.duration || ""} onChange={set("duration")} placeholder="5 hours" />
        </div>
      </div>

      <div className="upload-row">
        <div className="field" style={{ flex: 2, minWidth: 220 }}>
          <label htmlFor="u-as">Assignment title</label>
          <input id="u-as" value={draft.assignment_title || ""} onChange={set("assignment_title")} />
        </div>
        <div className="field" style={{ minWidth: 130 }}>
          <label htmlFor="u-dl">Deadline (days)</label>
          <input id="u-dl" type="number" min="1" value={draft.assignment_deadline_days || ""}
            onChange={set("assignment_deadline_days")} />
        </div>
        <div className="field" style={{ minWidth: 130 }}>
          <label htmlFor="u-pt">Points</label>
          <input id="u-pt" type="number" min="0" value={draft.assignment_points || ""}
            onChange={set("assignment_points")} />
        </div>
      </div>

      <div className="field">
        <label htmlFor="u-code">Worked example (code)</label>
        <textarea id="u-code" rows={7} className="content-area codearea"
          value={draft.code_example || ""} onChange={set("code_example")}
          placeholder={"# Shown at the end of the unit\nprint(\"Hello, COD26!\")"} />
      </div>
      <div className="field">
        <label htmlFor="u-think">Discussion question</label>
        <input id="u-think" value={draft.quiz_prompt || ""} onChange={set("quiz_prompt")}
          placeholder="A question students should be able to answer after this unit" />
      </div>

      <label className="checkline">
        <input type="checkbox" checked={!!draft.is_free} onChange={set("is_free")} />
        <span>
          <strong>Free unit</strong> — readable without paying. This one tick controls the
          chapters, videos, resources and the quiz.
        </span>
      </label>
      <label className="checkline">
        <input type="checkbox" checked={!!draft.is_published} onChange={set("is_published")} />
        <span><strong>Published</strong> — visible to students. Untick to hide while you write it.</span>
      </label>

      <div style={{ display: "flex", gap: 8, marginTop: 12, flexWrap: "wrap" }}>
        <button className="btn btn-primary" disabled={busy} onClick={onSave}>
          {busy ? "Saving…" : "Save unit"}
        </button>
        <button className="btn btn-ghost" onClick={onCancel}>Cancel</button>
      </div>
    </div>
  );
}

function ChapterEditor({ unit }) {
  const [chapters, setChapters] = useState(null);
  const [draft, setDraft] = useState(null);
  const [err, setErr] = useState("");
  const [busy, setBusy] = useState(false);

  const load = useCallback(async () => {
    try {
      setChapters(await contentService.chapters(unit.id));
    } catch (e) {
      setErr(e.message);
      setChapters([]);
    }
  }, [unit.id]);

  useEffect(() => { load(); }, [load]);

  async function run(fn) {
    setErr("");
    setBusy(true);
    try {
      await fn();
      await load();
    } catch (e) {
      setErr(e.message);
    } finally {
      setBusy(false);
    }
  }

  async function save() {
    if (!draft.title.trim()) throw new Error("A chapter needs a title.");
    if (draft.id) {
      await contentService.updateChapter(draft.id, {
        title: draft.title.trim(), content: draft.content,
      });
    } else {
      await contentService.createChapter(unit.id, {
        title: draft.title.trim(), content: draft.content,
      });
    }
    setDraft(null);
  }

  async function remove(ch) {
    if (!window.confirm(`Delete chapter "${ch.title}"? This cannot be undone.`)) return;
    await run(() => contentService.deleteChapter(ch.id));
  }

  async function move(ch, delta) {
    const i = chapters.findIndex((c) => c.id === ch.id);
    const j = i + delta;
    if (j < 0 || j >= chapters.length) return;
    const other = chapters[j];
    // Positions are unique per unit, so park one out of the way first.
    await run(async () => {
      await contentService.updateChapter(ch.id, { position: -1 });
      await contentService.updateChapter(other.id, { position: ch.position });
      await contentService.updateChapter(ch.id, { position: other.position });
    });
  }

  if (chapters === null) return <div className="loading">Loading chapters…</div>;

  return (
    <div className="chapter-editor">
      {err && <div className="error">{err}</div>}

      <div className="chapter-editor-head">
        <strong>{chapters.length} chapters</strong>
        <button className="btn btn-ghost btn-sm"
          onClick={() => setDraft({ title: "", content: "" })}>+ Add chapter</button>
      </div>

      {draft && (
        <div className="card" style={{ margin: "10px 0" }}>
          <div className="field">
            <label htmlFor="c-title">Chapter title</label>
            <input id="c-title" value={draft.title}
              onChange={(e) => setDraft({ ...draft, title: e.target.value })} />
          </div>
          <div className="field">
            <label htmlFor="c-body">Content</label>
            <textarea id="c-body" rows={8} className="content-area" value={draft.content}
              onChange={(e) => setDraft({ ...draft, content: e.target.value })}
              placeholder="Line breaks are preserved exactly as you type them." />
          </div>
          <div style={{ display: "flex", gap: 8, flexWrap: "wrap" }}>
            <button className="btn btn-primary btn-sm" disabled={busy}
              onClick={() => run(save)}>{busy ? "Saving…" : "Save chapter"}</button>
            <button className="btn btn-ghost btn-sm" onClick={() => setDraft(null)}>Cancel</button>
          </div>
        </div>
      )}

      {chapters.map((c, i) => (
        <div key={c.id} className="chapter-row">
          <div style={{ minWidth: 0 }}>
            <strong>Ch {i + 1}. {c.title}</strong>
            <div className="chapter-preview">{c.content.slice(0, 110)}{c.content.length > 110 ? "…" : ""}</div>
          </div>
          <div className="admin-row-actions">
            <button className="btn btn-ghost btn-sm" disabled={busy || i === 0}
              onClick={() => move(c, -1)} aria-label="Move up">↑</button>
            <button className="btn btn-ghost btn-sm" disabled={busy || i === chapters.length - 1}
              onClick={() => move(c, 1)} aria-label="Move down">↓</button>
            <button className="btn btn-ghost btn-sm" onClick={() => setDraft({ ...c })}>Edit</button>
            <button className="btn btn-ghost btn-sm" onClick={() => remove(c)}>Delete</button>
          </div>
        </div>
      ))}
    </div>
  );
}
