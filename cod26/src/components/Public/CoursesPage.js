import React from "react";
import { useContent } from "../../context/ContentContext";
import { isUnitFree } from "../../config/access";
import { useAuth } from "../../context/AuthContext";
import { navigate } from "../../lib/router";

const LEVELS = ["Beginner", "Intermediate", "Advanced"];

export default function CoursesPage() {
  const { user, hasAccess } = useAuth();
  const { units, totalUnits, loading, error } = useContent();

  function open(unit) {
    if (isUnitFree(unit)) return navigate(`/unit/${unit.id}`);
    if (hasAccess) return navigate("/dashboard");
    navigate(user ? "/dashboard" : "/login?tab=register");
  }

  if (loading) return <div className="loading">Loading the course…</div>;

  return (
    <div className="section">
      <div className="section-inner">
        <h1 className="section-title">Course units</h1>
        <p className="lede">
          {totalUnits} units, beginner to advanced. Free units are open to
          everyone — the rest unlock when you enrol.
        </p>

        {error && <div className="error" style={{ marginTop: 16 }}>{error}</div>}

        {LEVELS.map((level) => {
          const group = units.filter((u) => u.difficulty === level);
          if (!group.length) return null;
          return (
            <section key={level} style={{ marginTop: 30 }}>
              <h2 className="level-head">
                {level}
                <span className="level-count">{group.length} units</span>
              </h2>
              <div className="unit-grid">
                {group.map((u) => {
                  const free = isUnitFree(u);
                  const unlocked = free || hasAccess;
                  return (
                    <button key={u.id}
                      className={"unit-card" + (unlocked ? "" : " is-locked")}
                      onClick={() => open(u)}
                      aria-label={`Unit ${u.id}: ${u.title}${unlocked ? "" : " (locked)"}`}>
                      <div className="unit-top">
                        <span className="unit-num">UNIT {u.id}</span>
                        {free && <span className="badge-free">FREE</span>}
                        {!unlocked && <span className="unit-lock" aria-hidden="true">🔒</span>}
                      </div>
                      <div className="unit-title">{u.title}</div>
                      <div className="unit-meta">{u.duration} · {u.difficulty}</div>
                      {!unlocked && <div className="unit-cta">Locked — enrol to unlock</div>}
                      {free && <div className="unit-cta">Open free →</div>}
                    </button>
                  );
                })}
              </div>
            </section>
          );
        })}
      </div>
    </div>
  );
}
