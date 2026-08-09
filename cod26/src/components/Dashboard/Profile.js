import React, { useState } from "react";
import { useAuth } from "../../context/AuthContext";
import profileService from "../../services/profileService";

const CLASSES = ["9th", "10th", "11th", "12th", "B.Tech 1st Year", "Other"];

export default function Profile() {
  const { profile, refresh } = useAuth();
  const [f, setF] = useState({
    name: profile?.name || "",
    phone: profile?.phone || "",
    class_level: profile?.class_level || "",
    school: profile?.school || "",
    student_id: profile?.student_id || "",
  });
  const [busy, setBusy] = useState(false);
  const [err, setErr] = useState("");
  const [notice, setNotice] = useState("");

  const set = (k) => (e) => setF((p) => ({ ...p, [k]: e.target.value }));

  async function save() {
    setErr("");
    setNotice("");
    const problem = profileService.validate(f);
    if (problem) return setErr(problem);
    setBusy(true);
    try {
      await profileService.update(profile.id, f);
      await refresh();
      setNotice("Profile saved.");
    } catch (e) {
      setErr(e.message);
    } finally {
      setBusy(false);
    }
  }

  const expiry = profile?.access_expires_at
    ? new Date(profile.access_expires_at).toLocaleDateString()
    : null;

  return (
    <>
      <h2 className="page-title">👤 My profile</h2>
      <p className="page-sub">Keep these up to date — your certificate uses your name.</p>

      {err && <div className="error">{err}</div>}
      {notice && <div className="notice">{notice}</div>}

      <div className="card" style={{ maxWidth: 620 }}>
        <div className="field">
          <label htmlFor="p-name">Full name</label>
          <input id="p-name" value={f.name} onChange={set("name")} />
        </div>
        <div className="field">
          <label htmlFor="p-phone">Phone (10 digits)</label>
          <input id="p-phone" value={f.phone} onChange={set("phone")} inputMode="numeric" />
        </div>
        <div className="field">
          <label htmlFor="p-class">Class / grade</label>
          <select id="p-class" value={f.class_level} onChange={set("class_level")}>
            <option value="">Select</option>
            {CLASSES.map((c) => <option key={c}>{c}</option>)}
          </select>
        </div>
        <div className="field">
          <label htmlFor="p-school">School / college</label>
          <input id="p-school" value={f.school} onChange={set("school")} />
        </div>
        <div className="field">
          <label htmlFor="p-sid">Student ID</label>
          <input id="p-sid" value={f.student_id} onChange={set("student_id")} />
        </div>

        <button className="btn btn-primary" disabled={busy} onClick={save}>
          {busy ? "Saving…" : "Save changes"}
        </button>
      </div>

      <div className="card" style={{ maxWidth: 620, marginTop: 18 }}>
        <h3 style={{ fontSize: "1.05rem" }}>Account</h3>
        <dl className="deflist">
          <dt>Email</dt><dd>{profile?.email}</dd>
          <dt>Account type</dt><dd>{profile?.account_type === "school" ? "School code" : "Direct"}</dd>
          <dt>Access</dt>
          <dd>
            <span className={"tag " + (profile?.access_status === "active" ? "tag-green" : "tag-grey")}>
              {profile?.access_status}
            </span>
            {expiry && <span className="page-sub"> · until {expiry}</span>}
          </dd>
        </dl>
        {/* Email, role and access are deliberately read-only: a database
            trigger reverts any attempt to change them from the browser. */}
        <p className="page-sub" style={{ marginTop: 10 }}>
          To change your email or access, contact your school coordinator.
        </p>
      </div>
    </>
  );
}
