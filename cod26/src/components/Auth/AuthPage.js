import React, { useState } from "react";
import { useAuth } from "../../context/AuthContext";
import authService from "../../services/authService";
import { Link } from "../../lib/router";

const CLASSES = ["9th", "10th", "11th", "12th", "B.Tech 1st Year", "Other"];
const TABS = ["school", "login", "register"];

/** ?tab=register deep-links straight to the sign-up form. */
function initialTab() {
  const t = new URLSearchParams(window.location.search).get("tab");
  return TABS.includes(t) ? t : "login";
}

/**
 * Defined at module scope on purpose. Declaring this inside AuthPage would
 * create a new component type on every render, remounting the input and
 * dropping focus after each keystroke.
 */
function Field({ k, lbl, type = "text", placeholder, options, value, onChange }) {
  return (
    <div className="field">
      <label htmlFor={k}>{lbl}</label>
      {options ? (
        <select id={k} value={value} onChange={onChange}>
          <option value="">Select</option>
          {options.map((o) => <option key={o}>{o}</option>)}
        </select>
      ) : (
        <input id={k} type={type} value={value} onChange={onChange} placeholder={placeholder} />
      )}
    </div>
  );
}

export default function AuthPage() {
  const { refresh } = useAuth();
  const [tab, setTab] = useState(initialTab);
  const [err, setErr] = useState("");
  const [busy, setBusy] = useState(false);
  const [notice, setNotice] = useState("");
  const [f, setF] = useState({
    code: "", name: "", email: "", phone: "", class: "", school: "", studentId: "", password: "",
  });
  const set = (k) => (e) => setF((p) => ({ ...p, [k]: e.target.value }));
  const fld = (k, lbl, extra = {}) => (
    <Field k={k} lbl={lbl} value={f[k]} onChange={set(k)} {...extra} />
  );

  async function run(fn) {
    setErr("");
    setNotice("");
    setBusy(true);
    try {
      await fn();
    } catch (e) {
      setErr(e.message);
    } finally {
      setBusy(false);
    }
  }

  const tabBtn = (id, lbl) => (
    <button key={id} className={"tab" + (tab === id ? " is-active" : "")}
      onClick={() => { setTab(id); setErr(""); setNotice(""); }}>{lbl}</button>
  );

  return (
    <div className="auth-wrap"><div className="card card-narrow auth-card">
      <h1 style={{ color: "var(--orange)", textAlign: "center" }}>COD26</h1>
      <p className="tagline">Create. Optimize. Develop.</p>

      <div className="tabs">{tabBtn("school", "School Code")}{tabBtn("login", "Login")}{tabBtn("register", "Register & Pay")}</div>
      {err && <div className="error">{err}</div>}
      {notice && <div className="notice">{notice}</div>}

      {tab === "school" && <>
        {fld("code", "School Code")}
        {fld("name", "Full Name", { placeholder: "John Doe" })}
        {fld("email", "Email", { placeholder: "you@example.com" })}
        {fld("password", "Password (min 8)", { type: "password" })}
        {fld("phone", "Phone (10 digits)", { placeholder: "9876543210" })}
        {fld("class", "Class / Grade", { options: CLASSES })}
        {fld("school", "School / College")}
        {fld("studentId", "Student ID")}
        <button className="btn btn-primary btn-block" disabled={busy}
          onClick={() => run(async () => {
            await authService.verifySchoolCode(f);
            await refresh();
          })}>Verify &amp; Get Free Access</button>
      </>}

      {tab === "register" && <>
        {fld("name", "Full Name")}
        {fld("email", "Email")}
        {fld("phone", "Phone (10 digits)")}
        {fld("class", "Class / Grade", { options: CLASSES })}
        {fld("school", "School / College")}
        {fld("studentId", "Student ID")}
        {fld("password", "Password (min 8)", { type: "password" })}
        <button className="btn btn-primary btn-block" disabled={busy}
          onClick={() => run(async () => {
            const r = await authService.register(f);
            if (r?.requireEmailVerification) {
              setNotice("Check your email to verify your address, then sign in.");
            } else {
              await refresh();
            }
          })}>Register</button>
      </>}

      {tab === "login" && <>
        {fld("email", "Email")}
        {fld("password", "Password", { type: "password" })}
        <button className="btn btn-primary btn-block" disabled={busy}
          onClick={() => run(async () => {
            await authService.login(f);
            await refresh();
          })}>Sign In</button>
      </>}

      <div className="auth-preview">
        <span>Just looking?</span>
        <Link to="/unit/1" className="linkbtn">Read Chapter 1 free — no account needed →</Link>
      </div>
    </div></div>
  );
}
