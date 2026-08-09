import React from "react";
import { useContent } from "../../context/ContentContext";
import { isUnitFree } from "../../config/access";
import { useAuth } from "../../context/AuthContext";
import { navigate } from "../../lib/router";
import ChapterReader from "../Dashboard/ChapterReader";

/**
 * The free unit, readable without an account. Anything not on the free list
 * shows the enrol prompt instead - the reader itself also refuses, so a
 * hand-typed /unit/9 cannot leak paid content.
 */
export default function PublicUnit({ unitId, chapterIndex = 0 }) {
  const { user, hasAccess } = useAuth();
  const { getUnit, loading } = useContent();
  const unit = getUnit(unitId);

  if (loading) return <div className="loading">Loading unit…</div>;

  if (!unit) {
    return (
      <div className="section">
        <div className="section-inner narrow center">
          <h1 className="section-title">Unit not found</h1>
          <p className="lede">There is no unit {unitId} in this course.</p>
          <button className="btn btn-primary" onClick={() => navigate("/courses")}>
            See all units
          </button>
        </div>
      </div>
    );
  }

  // A signed-in student with access should read it inside the dashboard,
  // where progress is tracked.
  if (hasAccess) {
    return (
      <div className="section">
        <div className="section-inner narrow center">
          <h1 className="section-title">You're enrolled</h1>
          <p className="lede">Open this unit from your dashboard so your progress is saved.</p>
          <button className="btn btn-primary" onClick={() => navigate("/dashboard")}>
            Go to my dashboard
          </button>
        </div>
      </div>
    );
  }

  if (!isUnitFree(unit)) {
    return (
      <div className="section">
        <div className="section-inner narrow center">
          <span className="unit-lock" style={{ fontSize: "2rem" }} aria-hidden="true">🔒</span>
          <h1 className="section-title">Unit {unit.id} is part of the full course</h1>
          <p className="lede">
            <strong>{unit.title}</strong> unlocks when you enrol. Unit 1 is free if
            you want to try the course first.
          </p>
          <div className="hero-cta center">
            <button className="btn btn-primary" onClick={() => navigate("/login?tab=register")}>
              Enrol to unlock
            </button>
            <button className="btn btn-ghost" onClick={() => navigate("/unit/1")}>
              Read Unit 1 free
            </button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="section">
      <div className="section-inner">
        <div className="freebar">
          <span className="badge-free">FREE</span>
          <span>
            You're reading Unit {unit.id} free.{" "}
            {user ? "Enrol to unlock the other units." : "No account needed."}
          </span>
        </div>

        <ChapterReader
          unitId={unit.id}
          chapterIndex={chapterIndex}
          tier={user ? "free" : "guest"}
          onBack={() => navigate("/courses")}
          backLabel="← All units"
          onQuiz={() => navigate("/dashboard")}
          onExit={() => navigate("/login?tab=register")}
          onUnlock={() => navigate("/login?tab=register")}
          onNavigate={(id, index) => navigate(`/unit/${id}${index ? `/${index + 1}` : ""}`)}
        />

        <div className="freebar freebar-end">
          <div>
            <strong>Finished Unit {unit.id}?</strong>
            <div className="banner-sub">
              The remaining units, quizzes, certificate and study assistant come with enrolment.
            </div>
          </div>
          <button className="btn btn-primary" onClick={() => navigate("/login?tab=register")}>
            Enrol now
          </button>
        </div>
      </div>
    </div>
  );
}
