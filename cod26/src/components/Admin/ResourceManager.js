import React, { useState, useEffect, useRef } from "react";
import { useAuth } from "../../context/AuthContext";
import { useContent } from "../../context/ContentContext";
import resourceService, { validateFile, formatBytes, iconFor } from "../../services/resourceService";

export default function ResourceManager() {
  const { profile } = useAuth();
  const { units } = useContent();
  const [items, setItems] = useState([]);
  const [mode, setMode] = useState("file"); // file | link
  const [f, setF] = useState({ unitId: "", title: "", description: "", url: "" });
  const [file, setFile] = useState(null);
  const [busy, setBusy] = useState(false);
  const [err, setErr] = useState("");
  const [notice, setNotice] = useState("");
  const fileInput = useRef(null);

  const load = () => resourceService.all().then(setItems).catch((e) => setErr(e.message));
  useEffect(() => { load(); }, []);

  // Default to the first unit once the catalogue arrives.
  useEffect(() => {
    if (!f.unitId && units.length) setF((p) => ({ ...p, unitId: String(units[0].id) }));
  }, [units, f.unitId]);

  const set = (k) => (e) => setF((p) => ({ ...p, [k]: e.target.value }));

  function pick(e) {
    const chosen = e.target.files?.[0] ?? null;
    setErr(chosen ? validateFile(chosen) || "" : "");
    setNotice("");
    setFile(chosen);
    if (chosen && !f.title) {
      setF((p) => ({ ...p, title: chosen.name.replace(/\.[^.]+$/, "") }));
    }
  }

  function reset() {
    setF((p) => ({ unitId: p.unitId, title: "", description: "", url: "" }));
    setFile(null);
    if (fileInput.current) fileInput.current.value = "";
  }

  async function add() {
    setErr("");
    setNotice("");
    setBusy(true);
    try {
      if (mode === "file") {
        await resourceService.upload({ ...f, file, userId: profile?.id });
      } else {
        await resourceService.addLink({ ...f, userId: profile?.id });
      }
      setNotice(`Added to Unit ${f.unitId}.`);
      reset();
      await load();
    } catch (e) {
      setErr(e.message);
    } finally {
      setBusy(false);
    }
  }

  async function remove(r) {
    if (!window.confirm(`Delete "${r.title}"? This cannot be undone.`)) return;
    setErr("");
    try {
      await resourceService.remove(r);
      setNotice("Deleted.");
      await load();
    } catch (e) {
      setErr(e.message);
    }
  }

  const canSubmit = mode === "file" ? !!file : !!f.url.trim() && !!f.title.trim();
  const grouped = units
    .map((u) => ({ unit: u, list: items.filter((r) => r.unit_id === u.id) }))
    .filter((g) => g.list.length);

  return (
    <>
      <h2 className="page-title">📎 Notes &amp; resources</h2>
      <p className="page-sub">
        PDFs, cheat sheets and links attached to a unit. Files up to 25 MB.
        Students see them inside the unit, under the video.
      </p>

      {err && <div className="error">{err}</div>}
      {notice && <div className="notice">{notice}</div>}

      <div className="card" style={{ marginBottom: 22 }}>
        <div className="tabs" style={{ maxWidth: 320 }}>
          <button className={"tab" + (mode === "file" ? " is-active" : "")}
            onClick={() => { setMode("file"); setErr(""); }}>Upload file</button>
          <button className={"tab" + (mode === "link" ? " is-active" : "")}
            onClick={() => { setMode("link"); setErr(""); }}>Add link</button>
        </div>

        <div className="upload-row">
          <div className="field" style={{ minWidth: 190 }}>
            <label htmlFor="r-unit">Unit</label>
            <select id="r-unit" value={f.unitId} onChange={set("unitId")}>
              {units.map((u) => <option key={u.id} value={u.id}>{u.id}. {u.title}</option>)}
            </select>
          </div>
          <div className="field" style={{ flex: 1, minWidth: 200 }}>
            <label htmlFor="r-title">Title</label>
            <input id="r-title" value={f.title} onChange={set("title")}
              placeholder="e.g. Unit 1 cheat sheet" />
          </div>
          {mode === "file" ? (
            <div className="field" style={{ minWidth: 220 }}>
              <label htmlFor="r-file">File</label>
              <input id="r-file" ref={fileInput} type="file" onChange={pick} />
            </div>
          ) : (
            <div className="field" style={{ flex: 1, minWidth: 220 }}>
              <label htmlFor="r-url">URL</label>
              <input id="r-url" value={f.url} onChange={set("url")}
                placeholder="https://docs.python.org/3/tutorial/" />
            </div>
          )}
        </div>

        <div className="field">
          <label htmlFor="r-desc">Description (optional)</label>
          <input id="r-desc" value={f.description} onChange={set("description")}
            placeholder="One line telling students what this is for" />
        </div>

        {file && <p className="page-sub">{file.name} · {formatBytes(file.size)}</p>}

        <button className="btn btn-primary" disabled={busy || !canSubmit} onClick={add}>
          {busy ? "Saving…" : mode === "file" ? "Upload resource" : "Add link"}
        </button>
      </div>

      {grouped.length === 0 && <div className="notice">No resources yet.</div>}

      {grouped.map(({ unit, list }) => (
        <div key={unit.id} style={{ marginBottom: 18 }}>
          <h3 style={{ fontSize: "1.05rem" }}>Unit {unit.id}: {unit.title}</h3>
          {list.map((r) => (
            <div key={r.id} className="video-row">
              <div style={{ minWidth: 0, display: "flex", gap: 10, alignItems: "center" }}>
                <span aria-hidden="true" style={{ fontSize: "1.2rem" }}>{iconFor(r)}</span>
                <div style={{ minWidth: 0 }}>
                  <strong>{r.title}</strong>
                  <div className="page-sub" style={{ fontSize: ".85rem" }}>
                    {r.kind === "link" ? "Link" : formatBytes(r.size_bytes)}
                    {r.description ? ` · ${r.description}` : ""}
                  </div>
                </div>
              </div>
              <div style={{ display: "flex", gap: 8, flexShrink: 0 }}>
                <a className="btn btn-ghost btn-sm" href={r.url} target="_blank" rel="noreferrer">Open</a>
                <button className="btn btn-ghost btn-sm" onClick={() => remove(r)}>Delete</button>
              </div>
            </div>
          ))}
        </div>
      ))}
    </>
  );
}
