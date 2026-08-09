import React from "react";
import { useContent } from "../../context/ContentContext";

const k = { fontSize: ".72rem", color: "var(--muted)" };
const v = { fontWeight: 700, color: "var(--navy)" };

export default function Certificate({ progress, userName }) {
  const { totalUnits } = useContent();
  const completed = (progress.unitsCompleted || []).length;
  const total = totalUnits;
  const eligible = completed >= total;
  const pct = progress.totalProgress || 0;

  return (
    <>
      <h2 style={{ fontSize: "1.6rem" }}>📜 Certificate</h2>
      <p style={{ color: "var(--muted)" }}>{completed}/{total} units completed ({pct}%)</p>
      <div style={{ height: 8, background: "#eee", borderRadius: 99, overflow: "hidden", maxWidth: 420, margin: "8px 0 18px" }}>
        <div style={{ height: "100%", width: pct + "%", background: "linear-gradient(90deg,var(--orange),var(--orange2))" }} />
      </div>

      {eligible
        ? <div className="notice">Congratulations! You completed all units - here is your certificate.</div>
        : <div style={{ background: "var(--light)", borderRadius: 10, padding: 14, marginBottom: 14 }}>
            🔒 Complete all {total} units to unlock your real certificate. Below is a preview of what you'll earn - keep going!</div>}

      <CertCard dummy={!eligible} name={eligible ? userName : "Your Name Here"} />
    </>
  );
}

function CertCard({ dummy, name }) {
  const num = "COD26-" + (dummy ? "XXXXXX" : Date.now().toString().slice(-6));
  return (
    <div style={{ background: "#fff", border: "8px double var(--orange)", borderRadius: 14, padding: 36,
      textAlign: "center", maxWidth: 640, margin: "auto", position: "relative", opacity: dummy ? 0.92 : 1 }}>
      {dummy && <div style={{ position: "absolute", top: 14, right: -2, background: "var(--navy)", color: "#fff",
        fontSize: ".7rem", padding: "4px 14px", fontWeight: 700, borderRadius: "4px 0 0 4px" }}>PREVIEW</div>}
      <h2 style={{ color: "var(--orange)" }}>Certificate of Completion</h2>
      <div>This certifies that</div>
      <div style={{ fontSize: "1.7rem", fontWeight: 800, color: "var(--navy)", margin: "14px 0",
        borderBottom: "2px solid var(--border)", display: "inline-block", padding: "0 24px 6px" }}>{name}</div>
      <div>has successfully completed the<br /><strong>Complete Python Programming Mastery Course</strong></div>
      <div style={{ display: "flex", justifyContent: "space-around", margin: "20px 0", flexWrap: "wrap", gap: 10 }}>
        <div><div style={k}>Total Hours</div><div style={v}>85</div></div>
        <div><div style={k}>Date</div><div style={v}>{dummy ? "TBD" : new Date().toLocaleDateString()}</div></div>
        <div><div style={k}>Certificate No.</div><div style={v}>{num}</div></div>
      </div>
      <div style={{ marginTop: 18 }}>_____________________<br />CEO, COD26</div>
    </div>
  );
}
