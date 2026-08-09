import React, { useState, useEffect, useCallback } from "react";
import { useAuth } from "../../context/AuthContext";
import { useContent } from "../../context/ContentContext";
import studentService from "../../services/studentService";
import attendanceService from "../../services/attendanceService";
import { canOpenUnit, isUnitFree } from "../../config/access";
import { Link, navigate } from "../../lib/router";
import ChapterReader from "./ChapterReader";
import Quiz from "./Quiz";
import Leaderboard from "./Leaderboard";
import Certificate from "./Certificate";
import Profile from "./Profile";
import Attendance from "./Attendance";
import NotificationBell from "./NotificationBell";
import EnrolGate from "../Auth/EnrolGate";
import ChatWidget from "../Chat/ChatWidget";

export default function StudentDashboard({ tier = "full" }) {
  const { profile, logout } = useAuth();
  const { totalUnits } = useContent();
  const [view, setView] = useState("units");
  const [openUnit, setOpenUnit] = useState(null);
  const [chapterIndex, setChapterIndex] = useState(0);
  const [inQuiz, setInQuiz] = useState(false);
  const [progress, setProgress] = useState({ unitsCompleted: [], totalProgress: 0 });

  const loadProgress = useCallback(async () => {
    if (!profile) return;
    try {
      setProgress(await studentService.progress(profile.id, totalUnits));
    } catch {
      /* a progress fetch failure should not blank the dashboard */
    }
  }, [profile, totalUnits]);

  useEffect(() => { loadProgress(); }, [loadProgress]);

  // Stamp today's attendance once the student is actually in the dashboard.
  useEffect(() => {
    if (profile) attendanceService.mark();
  }, [profile]);

  const items = [
    ["units", "📚", "Units"],
    ["leaderboard", "🏆", "Leaderboard"],
    ["attendance", "📅", "Attendance"],
    ["profile", "👤", "Profile"],
  ];
  if (tier === "full") items.splice(2, 0, ["certificate", "📜", "Certificate"]);

  const go = (k) => { setView(k); setOpenUnit(null); setInQuiz(false); };

  async function signOut() {
    await logout();
    navigate("/");
  }

  return (
    <div>
      <header className="topbar">
        <Link to="/" className="brand">
          <span className="brand-mark">C26</span>
          <span>COD26</span>
        </Link>
        <div className="topbar-right">
          <NotificationBell />
          <span className="topbar-name">{profile?.name}</span>
          <button className="btn btn-primary btn-sm" onClick={signOut}>Logout</button>
        </div>
      </header>

      <div className="shell">
        <nav className="sidebar">
          {items.map(([k, icon, label]) => (
            <button key={k} className={"navitem" + (view === k ? " is-active" : "")}
              onClick={() => go(k)}>
              <span aria-hidden="true">{icon}</span>
              <span>{label}</span>
            </button>
          ))}
        </nav>

        <main className="content">
          {tier !== "full" && view === "units" && !openUnit && (
            <div className="banner">
              <div>
                <strong>You're on the free plan.</strong>
                <div className="banner-sub">
                  Free units are open. The other {Math.max(totalUnits - 1, 0)} units
                  unlock after enrolment.
                </div>
              </div>
              <button className="btn btn-primary" onClick={() => setView("enrol")}>
                Unlock all units
              </button>
            </div>
          )}

          {view === "units" && !openUnit && (
            <Units tier={tier} progress={progress}
              onOpen={(id) => { setOpenUnit(id); setChapterIndex(0); setInQuiz(false); }}
              onLocked={() => setView("enrol")} />
          )}
          {view === "units" && openUnit && !inQuiz && (
            <ChapterReader unitId={openUnit} chapterIndex={chapterIndex} tier={tier}
              onBack={() => setOpenUnit(null)}
              onQuiz={() => setInQuiz(true)}
              onUnlock={() => setView("enrol")}
              onNavigate={(id, index) => {
                setOpenUnit(id);
                setChapterIndex(index);
                window.scrollTo({ top: 0, behavior: "smooth" });
              }} />
          )}
          {view === "units" && openUnit && inQuiz && (
            <Quiz unitId={openUnit}
              onBack={() => setInQuiz(false)}
              onDone={loadProgress}
              onUnits={() => { setOpenUnit(null); setInQuiz(false); }} />
          )}
          {view === "leaderboard" && <Leaderboard />}
          {view === "certificate" && <Certificate progress={progress} userName={profile?.name} />}
          {view === "attendance" && <Attendance />}
          {view === "profile" && <Profile />}
          {view === "enrol" && <EnrolGate onBack={() => go("units")} />}
        </main>
      </div>

      <ChatWidget />
    </div>
  );
}

function Units({ tier, progress, onOpen, onLocked }) {
  const { units, totalUnits, loading } = useContent();
  const done = new Set(progress.unitsCompleted || []);

  if (loading) return <div className="loading">Loading units…</div>;

  return (
    <>
      <h2 className="page-title">📚 Course Units</h2>
      <p className="page-sub">
        {done.size}/{totalUnits} completed · {progress.totalProgress}%
      </p>
      <div className="progress-track">
        <div className="progress-fill" style={{ width: progress.totalProgress + "%" }} />
      </div>

      <div className="unit-grid">
        {units.map((u) => {
          const unlocked = canOpenUnit(tier, u);
          return (
            <button key={u.id}
              className={"unit-card" + (unlocked ? "" : " is-locked")}
              aria-label={`Unit ${u.id}: ${u.title}${unlocked ? "" : " (locked)"}`}
              onClick={() => (unlocked ? onOpen(u.id) : onLocked())}>
              <div className="unit-top">
                <span className="unit-num">UNIT {u.id}</span>
                {done.has(u.id) && <span className="unit-done" title="Completed">✓</span>}
                {!unlocked && <span className="unit-lock" aria-hidden="true">🔒</span>}
                {unlocked && isUnitFree(u) && tier !== "full" && (
                  <span className="badge-free">FREE</span>
                )}
              </div>
              <div className="unit-title">{u.title}</div>
              <div className="unit-meta">{u.duration} · {u.difficulty}</div>
              {!unlocked && <div className="unit-cta">Locked — Upgrade</div>}
            </button>
          );
        })}
      </div>
    </>
  );
}
