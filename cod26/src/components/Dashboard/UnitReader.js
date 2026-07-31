import React, { useState } from "react";
import { getUnitById } from "../../data/unitdata";

const FALLBACK = [{ pageNum: 1, title: "Overview",
  content: "This unit is fully documented in COD26-Implementation-Guide.pdf with 4+ pages of theory, code examples, a quiz and an assignment." }];

export default function UnitReader({ unitId, onBack, onQuiz }) {
  const unit = getUnitById(unitId);
  const [pg, setPg] = useState(0);

  if (!unit) {
    return (
      <div style={{ background: "#fff", borderRadius: 14, padding: 26, boxShadow: "var(--shadow)" }}>
        <button className="btn btn-ghost" onClick={onBack}>← All Units</button>
        <p style={{ marginTop: 12 }}>Unit {unitId} was not found.</p>
      </div>
    );
  }

  const pages = unit.pages && unit.pages.length ? unit.pages : FALLBACK;
  const page = pages[Math.min(pg, pages.length - 1)];
  const last = pg >= pages.length - 1;

  return (
    <div style={{ background: "#fff", borderRadius: 14, padding: 26, boxShadow: "var(--shadow)", maxWidth: 820 }}>
      <button className="btn btn-ghost" style={{ marginBottom: 14 }} onClick={onBack}>← All Units</button>
      <h2 style={{ fontSize: "1.5rem" }}>Unit {unit.id}: {unit.title}</h2>
      <p style={{ color: "var(--muted)" }}>{unit.duration} · {unit.difficulty}</p>
      <h3 style={{ color: "var(--orange)", marginTop: 12 }}>{page.title}</h3>
      <div style={{ background: "var(--light)", borderLeft: "4px solid var(--orange)", borderRadius: 10,
        padding: 20, minHeight: 140, lineHeight: 1.7, margin: "16px 0", whiteSpace: "pre-wrap" }}>{page.content}</div>
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
        <button className="btn btn-ghost" disabled={pg === 0} onClick={() => setPg(pg - 1)}>← Previous</button>
        <span style={{ color: "var(--muted)" }}>Page {pg + 1} of {pages.length}</span>
        {last
          ? <button className="btn btn-primary" onClick={onQuiz}>Take Quiz →</button>
          : <button className="btn btn-primary" onClick={() => setPg(pg + 1)}>Next →</button>}
      </div>
      {last && unit.assignment && (
        <div style={{ marginTop: 18, background: "var(--light)", borderRadius: 10, padding: 14 }}>
          <strong>📝 Assignment:</strong> {unit.assignment.title}
          <div style={{ fontSize: ".78rem", color: "var(--muted)" }}>
            Deadline: {unit.assignment.deadline} days · {unit.assignment.pointValue} points</div>
        </div>
      )}
    </div>
  );
}
