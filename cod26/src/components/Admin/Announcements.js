import React, { useState, useEffect } from "react";
import { useAuth } from "../../context/AuthContext";
import notificationService from "../../services/notificationService";
import adminService from "../../services/adminService";

const LEVELS = [
  ["info", "ℹ️ Info"],
  ["success", "✅ Good news"],
  ["warning", "⚠️ Important"],
];

export default function Announcements() {
  const { profile } = useAuth();
  const [sent, setSent] = useState([]);
  const [students, setStudents] = useState([]);
  const [f, setF] = useState({ title: "", body: "", level: "info", target: "all", userId: "" });
  const [busy, setBusy] = useState(false);
  const [err, setErr] = useState("");
  const [notice, setNotice] = useState("");

  const load = () => notificationService.sent().then(setSent).catch((e) => setErr(e.message));

  useEffect(() => {
    load();
    // Needed for the "one student" target list.
    adminService.students({}).then((r) => setStudents(r.students || [])).catch(() => {});
  }, []);

  const set = (k) => (e) => setF((p) => ({ ...p, [k]: e.target.value }));

  async function send() {
    setErr("");
    setNotice("");
    if (!f.title.trim()) return setErr("Give the announcement a title.");
    if (f.target === "one" && !f.userId) return setErr("Pick a student, or send to everyone.");
    setBusy(true);
    try {
      await notificationService.send({
        title: f.title.trim(),
        body: f.body.trim(),
        level: f.level,
        userId: f.target === "one" ? f.userId : null,
        createdBy: profile?.id,
      });
      setNotice(f.target === "one" ? "Sent to that student." : "Sent to every student.");
      setF({ title: "", body: "", level: "info", target: "all", userId: "" });
      await load();
    } catch (e) {
      setErr(e.message);
    } finally {
      setBusy(false);
    }
  }

  async function remove(n) {
    if (!window.confirm(`Delete "${n.title}"? Students will no longer see it.`)) return;
    setErr("");
    try {
      await notificationService.remove(n.id);
      await load();
    } catch (e) {
      setErr(e.message);
    }
  }

  return (
    <>
      <h2 className="page-title">🔔 Announcements</h2>
      <p className="page-sub">
        Appears under the bell in every student's dashboard. Broadcast to everyone
        or send to one student.
      </p>

      {err && <div className="error">{err}</div>}
      {notice && <div className="notice">{notice}</div>}

      <div className="card" style={{ marginBottom: 22, maxWidth: 720 }}>
        <div className="upload-row">
          <div className="field" style={{ flex: 1, minWidth: 220 }}>
            <label htmlFor="n-title">Title</label>
            <input id="n-title" value={f.title} onChange={set("title")}
              placeholder="e.g. Unit 6 videos are up" />
          </div>
          <div className="field" style={{ minWidth: 160 }}>
            <label htmlFor="n-level">Type</label>
            <select id="n-level" value={f.level} onChange={set("level")}>
              {LEVELS.map(([v, l]) => <option key={v} value={v}>{l}</option>)}
            </select>
          </div>
        </div>

        <div className="field">
          <label htmlFor="n-body">Message</label>
          <textarea id="n-body" rows={3} className="content-area" value={f.body}
            onChange={set("body")} placeholder="Optional detail." />
        </div>

        <div className="upload-row">
          <div className="field" style={{ minWidth: 190 }}>
            <label htmlFor="n-target">Send to</label>
            <select id="n-target" value={f.target} onChange={set("target")}>
              <option value="all">Every student</option>
              <option value="one">One student</option>
            </select>
          </div>
          {f.target === "one" && (
            <div className="field" style={{ flex: 1, minWidth: 220 }}>
              <label htmlFor="n-student">Student</label>
              <select id="n-student" value={f.userId} onChange={set("userId")}>
                <option value="">Select a student</option>
                {students.map((s) => (
                  <option key={s.uid} value={s.uid}>{s.name} — {s.email}</option>
                ))}
              </select>
            </div>
          )}
        </div>

        <button className="btn btn-primary" disabled={busy} onClick={send}>
          {busy ? "Sending…" : "Send announcement"}
        </button>
      </div>

      <h3 style={{ fontSize: "1.05rem" }}>Sent</h3>
      {sent.length === 0 && <div className="notice">Nothing sent yet.</div>}
      {sent.map((n) => (
        <div key={n.id} className="video-row">
          <div style={{ minWidth: 0 }}>
            <strong>{n.title}</strong>
            <div className="page-sub" style={{ fontSize: ".85rem" }}>
              {n.user_id ? "One student" : "Everyone"} · {n.level} ·{" "}
              {new Date(n.created_at).toLocaleString()}
            </div>
            {n.body && <div className="page-sub" style={{ fontSize: ".88rem" }}>{n.body}</div>}
          </div>
          <button className="btn btn-ghost btn-sm" onClick={() => remove(n)}>Delete</button>
        </div>
      ))}
    </>
  );
}
