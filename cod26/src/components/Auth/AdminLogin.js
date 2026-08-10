import React, { useState } from "react";
import { useAuth } from "../../context/AuthContext";
import authService from "../../services/authService";
import { Link, navigate } from "../../lib/router";

/**
 * A separate door for staff. It is the same credential check as the student
 * login - the server decides what an account may do, not this screen - but
 * keeping it apart means the admin URL is not advertised on the public form,
 * and a student who lands here is told plainly where to go instead.
 *
 * App.js redirects on the way out: an admin goes to /admin, anyone else to
 * /dashboard, so no role check is duplicated here.
 */
export default function AdminLogin() {
  const { refresh, profile, user } = useAuth();
  const [f, setF] = useState({ email: "", password: "" });
  const [busy, setBusy] = useState(false);
  const [err, setErr] = useState("");

  const set = (k) => (e) => setF((p) => ({ ...p, [k]: e.target.value }));

  async function signIn(e) {
    e.preventDefault();
    if (busy) return;
    setErr("");
    if (!f.email.trim() || !f.password) {
      setErr("Enter your email and password.");
      return;
    }
    setBusy(true);
    try {
      await authService.login({ email: f.email.trim(), password: f.password });
      await refresh();
      // App.js sends admins to /admin and everyone else to /dashboard.
    } catch (e2) {
      setErr(e2.message || "Could not sign in. Check your details and try again.");
    } finally {
      setBusy(false);
    }
  }

  // Already signed in and looking at the staff door: say so rather than
  // showing a form that would just bounce.
  if (user) {
    const admin = profile?.role === "admin";
    return (
      <div className="auth-wrap">
        <div className="card card-narrow admin-card fade-up">
          <div className="admin-badge" aria-hidden="true">🔑</div>
          <h1 className="admin-title">
            {admin ? "You're signed in as an admin" : "You're signed in"}
          </h1>
          <p className="tagline" style={{ fontStyle: "normal" }}>
            {admin
              ? "Head to the dashboard to manage the course."
              : `${profile?.name || "This account"} is a student account, not an administrator.`}
          </p>
          <button className="btn btn-primary btn-block"
            onClick={() => navigate(admin ? "/admin" : "/dashboard")}>
            {admin ? "Open admin dashboard" : "Go to my dashboard"}
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="auth-wrap">
      <form className="card card-narrow admin-card fade-up" onSubmit={signIn}>
        <div className="admin-badge" aria-hidden="true">🔑</div>
        <h1 className="admin-title">Administrator sign in</h1>
        <p className="tagline">Staff access to the COD26 course manager.</p>

        {err && <div className="error" role="alert">{err}</div>}

        <div className="field">
          <label htmlFor="a-email">Email</label>
          <input id="a-email" type="email" autoComplete="username"
            value={f.email} onChange={set("email")} placeholder="you@example.com" />
        </div>
        <div className="field">
          <label htmlFor="a-pass">Password</label>
          <input id="a-pass" type="password" autoComplete="current-password"
            value={f.password} onChange={set("password")} />
        </div>

        <button className="btn btn-primary btn-block" type="submit" disabled={busy}>
          {busy ? "Signing in…" : "Sign in"}
        </button>

        <div className="auth-preview">
          <span>Not staff?</span>
          <Link to="/login" className="linkbtn">Student sign in →</Link>
        </div>
      </form>
    </div>
  );
}
