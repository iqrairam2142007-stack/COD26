import React, { useState, useEffect, useRef } from "react";
import { useAuth } from "../../context/AuthContext";
import videoService, { validateFile, formatBytes } from "../../services/videoService";
import { useContent } from "../../context/ContentContext";

export default function VideoManager() {
  const { profile } = useAuth();
  const { units } = useContent();
  const [videos, setVideos] = useState([]);
  const [unitId, setUnitId] = useState("1");
  const [title, setTitle] = useState("");
  const [file, setFile] = useState(null);
  const [busy, setBusy] = useState(false);
  const [err, setErr] = useState("");
  const [notice, setNotice] = useState("");
  const fileInput = useRef(null);

  const load = () =>
    videoService.all().then(setVideos).catch((e) => setErr(e.message));

  useEffect(() => { load(); }, []);

  function pick(e) {
    const f = e.target.files?.[0] ?? null;
    setErr(f ? validateFile(f) || "" : "");
    setNotice("");
    setFile(f);
    if (f && !title) setTitle(f.name.replace(/\.[^.]+$/, ""));
  }

  async function upload() {
    const problem = validateFile(file);
    if (problem) return setErr(problem);
    setErr("");
    setNotice("");
    setBusy(true);
    try {
      await videoService.upload({ unitId, title, file, userId: profile?.id });
      setNotice(`Uploaded to Unit ${unitId}.`);
      setFile(null);
      setTitle("");
      if (fileInput.current) fileInput.current.value = "";
      await load();
    } catch (e) {
      setErr(e.message);
    } finally {
      setBusy(false);
    }
  }

  async function remove(v) {
    if (!window.confirm(`Delete "${v.title}" from Unit ${v.unit_id}? This cannot be undone.`)) return;
    setErr("");
    setNotice("");
    try {
      await videoService.remove(v);
      setNotice("Deleted.");
      await load();
    } catch (e) {
      setErr(e.message);
    }
  }

  const byUnit = units.map((u) => ({
    unit: u,
    items: videos.filter((v) => v.unit_id === u.id),
  }));

  return (
    <>
      <h2 className="page-title">🎬 Course Videos</h2>
      <p className="page-sub">MP4 or WebM, up to 100 MB. Students see these inside the unit.</p>

      {err && <div className="error">{err}</div>}
      {notice && <div className="notice">{notice}</div>}

      <div className="card" style={{ marginBottom: 22 }}>
        <div className="upload-row">
          <div className="field" style={{ minWidth: 170 }}>
            <label htmlFor="v-unit">Unit</label>
            <select id="v-unit" value={unitId} onChange={(e) => setUnitId(e.target.value)}>
              {units.map((u) => (
                <option key={u.id} value={u.id}>{u.id}. {u.title}</option>
              ))}
            </select>
          </div>
          <div className="field" style={{ flex: 1, minWidth: 200 }}>
            <label htmlFor="v-title">Title</label>
            <input id="v-title" value={title} onChange={(e) => setTitle(e.target.value)}
              placeholder="e.g. Installing Python on Windows" />
          </div>
          <div className="field" style={{ minWidth: 220 }}>
            <label htmlFor="v-file">Video file</label>
            <input id="v-file" ref={fileInput} type="file" accept="video/mp4,video/webm,.mp4,.webm"
              onChange={pick} />
          </div>
        </div>
        {file && <p className="page-sub">{file.name} · {formatBytes(file.size)}</p>}
        <button className="btn btn-primary" disabled={busy || !file} onClick={upload}>
          {busy ? "Uploading…" : "Upload video"}
        </button>
      </div>

      {byUnit.filter((g) => g.items.length).length === 0 && (
        <div className="notice">No videos uploaded yet.</div>
      )}

      {byUnit.filter((g) => g.items.length).map(({ unit, items }) => (
        <div key={unit.id} style={{ marginBottom: 18 }}>
          <h3 style={{ fontSize: "1.05rem" }}>Unit {unit.id}: {unit.title}</h3>
          {items.map((v) => (
            <div key={v.id} className="video-row">
              <div style={{ minWidth: 0 }}>
                <strong>{v.title}</strong>
                <div className="page-sub" style={{ fontSize: ".85rem" }}>
                  {formatBytes(v.size_bytes)} · {new Date(v.created_at).toLocaleDateString()}
                </div>
              </div>
              <div style={{ display: "flex", gap: 8, flexShrink: 0 }}>
                <a className="btn btn-ghost btn-sm" href={v.url} target="_blank" rel="noreferrer">Preview</a>
                <button className="btn btn-ghost btn-sm" onClick={() => remove(v)}>Delete</button>
              </div>
            </div>
          ))}
        </div>
      ))}
    </>
  );
}
