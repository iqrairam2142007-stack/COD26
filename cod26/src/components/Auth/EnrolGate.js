import React, { useState, useEffect } from "react";
import { useAuth } from "../../context/AuthContext";
import authService, { formatFee } from "../../services/authService";
import { useContent } from "../../context/ContentContext";

/**
 * The paid-enrolment card. Reachable two ways: as the whole screen for a
 * signed-in student with no access, and as a panel inside the dashboard when
 * a free-tier student taps "Unlock all units".
 */
export default function EnrolGate({ onBack }) {
  const { user, profile, refresh, logout } = useAuth();
  const { totalUnits } = useContent();
  const [err, setErr] = useState("");
  const [notice, setNotice] = useState("");
  const [busy, setBusy] = useState(false);
  const [fee, setFee] = useState(null);

  useEffect(() => {
    authService.classFee().then(setFee).catch(() => {});
  }, []);

  const months = fee ? fee.access_months + " months" : "6 months";

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

  return (
    <div className="card card-narrow" style={{ textAlign: "center", margin: "0 auto" }}>
      <h1 style={{ color: "var(--orange)" }}>Complete Your Enrolment</h1>
      <p style={{ color: "var(--muted)", margin: "6px 0 14px" }}>
        Unlock all {totalUnits} units for {months}
      </p>
      <div style={{ fontSize: "3rem", fontWeight: 800, color: "var(--orange)", margin: "10px 0" }}>
        {fee ? formatFee(fee) : "…"}
        <span style={{ fontSize: "1rem", color: "var(--muted)" }}>/{months}</span>
      </div>
      {err && <div className="error">{err}</div>}
      {notice && <div className="notice">{notice}</div>}
      <button className="btn btn-primary btn-block" disabled={busy || !fee}
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
      <button className="btn btn-ghost btn-block" style={{ marginTop: 10 }}
        onClick={() => run(refresh)}>I have already paid — refresh</button>
      {onBack ? (
        <button className="btn btn-ghost btn-block" style={{ marginTop: 10 }}
          onClick={onBack}>← Back to units</button>
      ) : (
        <button className="btn btn-ghost btn-block" style={{ marginTop: 10 }}
          onClick={logout}>Sign out</button>
      )}
    </div>
  );
}
