import React, { useState, useEffect, useCallback } from "react";
import { useAuth } from "../../context/AuthContext";
import studentService from "../../services/studentService";
import { unitData, TOTAL_UNITS } from "../../data/unitdata";
import UnitReader from "./UnitReader";
import Quiz from "./Quiz";
import Leaderboard from "./Leaderboard";
import Certificate from "./Certificate";

const navStyle = { background: "var(--navy)", color: "#fff", display: "flex", alignItems: "center",
  justifyContent: "space-between", padding: "12px 22px", position: "sticky", top: 0, zIndex: 50 };
const sideStyle = { width: 210, background: "#fff", borderRight: "1px solid var(--border)", padding: "16px 0", flexShrink: 0 };
const mi = (a) => ({ display: "flex", gap: 11, padding: "12px 18px", color: a ? "var(--orange)" : "var(--grey)",
  fontWeight: 600, width: "100%", textAlign: "left", background: a ? "var(--light)" : "transparent",
  borderLeft: "3px solid " + (a ? "var(--orange)" : "transparent"), fontSize: ".92rem" });

export default function StudentDashboard() {
  const { profile, logout } = useAuth();
  const [view, setView] = useState("units");
  const [openUnit, setOpenUnit] = useState(null);
  const [inQuiz, setInQuiz] = useState(false);
  const [progress, setProgress] = useState({ unitsCompleted: [], totalProgress: 0 });

  const loadProgress = useCallback(async () => {
    if (!profile) return;
    try {
      setProgress(await studentService.progress(profile.id));
    } catch {
      /* a progress fetch failure should not blank the dashboard */
    }
  }, [profile]);

  useEffect(() => { loadProgress(); }, [loadProgress]);

  const items = [["units", "📚 Units"], ["leaderboard", "🏆 Leaderboard"], ["certificate", "📜 Certificate"]];

  return (
    <div>
      <div style={navStyle}>
        <div style={{ display: "flex", alignItems: "center", gap: 10, fontWeight: 800, fontSize: "1.3rem" }}>
          <div style={{ width: 34, height: 34, borderRadius: 9, background: "linear-gradient(135deg,var(--orange),var(--orange2))",
            display: "flex", alignItems: "center", justifyContent: "center", fontWeight: 900, fontSize: ".85rem" }}>C26</div>
          COD26
        </div>
        <div style={{ display: "flex", gap: 14, alignItems: "center", fontSize: ".9rem" }}>
          <span style={{ color: "#cbd5e1" }}>{profile?.name}</span>
          <button onClick={logout} style={{ background: "var(--orange)", color: "#fff", padding: "7px 14px", borderRadius: 8, fontWeight: 600 }}>Logout</button>
        </div>
      </div>

      <div style={{ display: "flex", minHeight: "calc(100vh - 58px)" }}>
        <div style={sideStyle}>
          {items.map(([k, l]) => (
            <button key={k} style={mi(view === k)}
              onClick={() => { setView(k); setOpenUnit(null); setInQuiz(false); }}>{l}</button>
          ))}
        </div>

        <div style={{ flex: 1, padding: 26, overflowY: "auto" }}>
          {view === "units" && !openUnit && (
            <Units progress={progress} onOpen={(id) => { setOpenUnit(id); setInQuiz(false); }} />
          )}
          {view === "units" && openUnit && !inQuiz && (
            <UnitReader unitId={openUnit} onBack={() => setOpenUnit(null)} onQuiz={() => setInQuiz(true)} />
          )}
          {view === "units" && openUnit && inQuiz && (
            <Quiz unitId={openUnit}
              onBack={() => setInQuiz(false)}
              onDone={loadProgress}
              onUnits={() => { setOpenUnit(null); setInQuiz(false); }} />
          )}
          {view === "leaderboard" && <Leaderboard />}
          {view === "certificate" && <Certificate progress={progress} userName={profile?.name} />}
        </div>
      </div>
    </div>
  );
}

function Units({ progress, onOpen }) {
  const done = new Set(progress.unitsCompleted || []);
  return (
    <>
      <h2 style={{ fontSize: "1.6rem" }}>📚 Course Units</h2>
      <p style={{ color: "var(--muted)" }}>
        {done.size}/{TOTAL_UNITS} completed · {progress.totalProgress}%
      </p>
      <div style={{ height: 8, background: "#eee", borderRadius: 99, overflow: "hidden", maxWidth: 420, margin: "8px 0 20px" }}>
        <div style={{ height: "100%", width: progress.totalProgress + "%",
          background: "linear-gradient(90deg,var(--orange),var(--orange2))" }} />
      </div>
      <div style={{ display: "grid", gap: 16, gridTemplateColumns: "repeat(auto-fill,minmax(240px,1fr))" }}>
        {unitData.map((u) => (
          <button key={u.id} onClick={() => onOpen(u.id)}
            style={{ background: "#fff", border: "1px solid var(--border)", borderRadius: 14, padding: 18,
              textAlign: "left", boxShadow: "0 2px 10px rgba(0,0,0,.05)" }}>
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
              <span style={{ fontSize: ".72rem", fontWeight: 700, color: "var(--muted)" }}>UNIT {u.id}</span>
              {done.has(u.id) && <span style={{ color: "var(--green)", fontWeight: 700 }}>✓</span>}
            </div>
            <div style={{ fontWeight: 700, margin: "6px 0", color: "var(--navy)" }}>{u.title}</div>
            <div style={{ fontSize: ".78rem", color: "var(--muted)" }}>{u.duration} · {u.difficulty}</div>
          </button>
        ))}
      </div>
    </>
  );
}
