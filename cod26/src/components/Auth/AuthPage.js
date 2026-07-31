import React, { useState, useEffect } from "react";
import { useAuth } from "../../context/AuthContext";
import authService, { formatFee } from "../../services/authService";

const wrap = { minHeight: "100vh", display: "flex", alignItems: "center", justifyContent: "center", padding: 24 };
const card = { background: "#fff", borderRadius: 20, boxShadow: "var(--shadow)", width: "100%", maxWidth: 460, padding: 34 };
const tabs = { display: "flex", gap: 6, background: "var(--light)", borderRadius: 12, padding: 5, margin: "0 0 18px" };
const fieldStyle = { marginBottom: 13 };
const labelStyle = { display: "block", fontSize: ".82rem", fontWeight: 600, color: "var(--grey)", marginBottom: 5 };

const CLASSES = ["9th", "10th", "11th", "12th", "B.Tech 1st Year", "Other"];

/**
 * Defined at module scope on purpose. Declaring this inside AuthPage would
 * create a new component type on every render, remounting the input and
 * dropping focus after each keystroke.
 */
function Field({ k, lbl, type = "text", placeholder, options, value, onChange }) {
  return (
    <div style={fieldStyle}>
      <label style={labelStyle} htmlFor={k}>{lbl}</label>
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
  const { user, profile, refresh, logout } = useAuth();
  const [tab, setTab] = useState("school");
  const [err, setErr] = useState("");
  const [busy, setBusy] = useState(false);
  const [notice, setNotice] = useState("");
  const [fee, setFee] = useState(null);

  useEffect(() => {
    if (!user) return;
    authService.classFee().then(setFee).catch(() => {});
  }, [user]);
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
    <button key={id} onClick={() => { setTab(id); setErr(""); setNotice(""); }}
      style={{ flex: 1, padding: 9, borderRadius: 9, fontWeight: 600, fontSize: ".85rem",
        background: tab === id ? "#fff" : "transparent", color: tab === id ? "var(--orange)" : "var(--grey)",
        boxShadow: tab === id ? "0 2px 6px rgba(0,0,0,.08)" : "none" }}>{lbl}</button>
  );

  // Signed in but no active access -> show the checkout gate.
  if (user) {
    const months = fee ? fee.access_months + " months" : "6 months";
    return (
      <div style={wrap}><div style={{ ...card, textAlign: "center" }}>
        <h1 style={{ color: "var(--orange)" }}>Complete Your Enrolment</h1>
        <p style={{ color: "var(--muted)", margin: "6px 0 14px" }}>
          Unlock all 17 units for {months}
        </p>
        <div style={{ fontSize: "3rem", fontWeight: 800, color: "var(--orange)", margin: "10px 0" }}>
          {fee ? formatFee(fee) : "…"}
          <span style={{ fontSize: "1rem", color: "var(--muted)" }}>/{months}</span>
        </div>
        {err && <div className="error">{err}</div>}
        {notice && <div className="notice">{notice}</div>}
        <button className="btn btn-primary" style={{ width: "100%" }} disabled={busy || !fee}
          onClick={() => run(async () => {
            const r = await authService.startCheckout(user, profile);
            if (r.status === "cancelled") return;
            // Access is granted by the webhook, which lands a moment after the
            // modal closes. Poll a few times before telling them to wait.
            setNotice("Payment received. Confirming with the bank…");
            for (let i = 0; i < 6; i++) {
              await new Promise((res) => setTimeout(res, 2000));
              await refresh();
            }
            setNotice("Still confirming. This can take a minute — tap refresh below.");
          })}>
          {busy ? "Opening checkout…" : "Pay & Get Access"}
        </button>
        <button className="btn btn-ghost" style={{ width: "100%", marginTop: 10 }}
          onClick={() => run(refresh)}>I have already paid — refresh</button>
        <button className="btn btn-ghost" style={{ width: "100%", marginTop: 10 }}
          onClick={logout}>Sign out</button>
      </div></div>
    );
  }

  return (
    <div style={wrap}><div style={card}>
      <h1 style={{ color: "var(--orange)", textAlign: "center" }}>COD26</h1>
      <p style={{ color: "var(--muted)", textAlign: "center", fontStyle: "italic", marginBottom: 18 }}>
        Create. Optimize. Develop.</p>
      <div style={tabs}>{tabBtn("school", "School Code")}{tabBtn("login", "Login")}{tabBtn("register", "Register & Pay")}</div>
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
        <button className="btn btn-primary" style={{ width: "100%" }} disabled={busy}
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
        <button className="btn btn-primary" style={{ width: "100%" }} disabled={busy}
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
        <button className="btn btn-primary" style={{ width: "100%" }} disabled={busy}
          onClick={() => run(async () => {
            await authService.login(f);
            await refresh();
          })}>Sign In</button>
      </>}
    </div></div>
  );
}
