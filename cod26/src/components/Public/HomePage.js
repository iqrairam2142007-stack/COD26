import React, { useState, useEffect } from "react";
import { useContent } from "../../context/ContentContext";
import { isUnitFree } from "../../config/access";
import authService, { formatFee } from "../../services/authService";
import { Link, navigate } from "../../lib/router";

const FEATURES = [
  ["📚", "Structured units",
    "From your first print() to a capstone project, in the order things actually build on each other."],
  ["🎬", "Lesson videos",
    "Watch the walkthrough for a unit, then read the notes at your own pace."],
  ["🎯", "A quiz after every unit",
    "Thirty minutes, 60% to pass, and you see exactly which answers were wrong and why."],
  ["💬", "An assistant that knows the course",
    "Stuck at 1am on an IndentationError? Ask in plain English or Hinglish and get an answer."],
  ["🏆", "Leaderboard",
    "Ranked by score, then by speed. Compare against your school or everyone."],
  ["📜", "Certificate on completion",
    "Finish every unit and your certificate is generated with your name on it."],
  ["📎", "Notes and resources",
    "Downloadable notes, cheat sheets and links attached to each unit."],
];

const BENEFITS = [
  ["Start free, decide later",
    "Unit 1 — including Chapter 1 — is open to everyone. No card, no signup, no trial timer. Read it, take the quiz, then choose."],
  ["Built for Indian classrooms",
    "Written for Class 9–12 and B.Tech first-year students. Ask questions in Hinglish; the assistant answers the same way."],
  ["Your school may already cover it",
    "If your school issued a COD26 code, redeem it for full access at no cost to you."],
  ["Learn on the phone you have",
    "Every screen works on a 375px phone — the units, the quiz, the videos and the chat."],
];

const STEPS = [
  ["Read the chapter", "Short pages you can finish in a sitting, with examples to type out yourself."],
  ["Watch the video", "Where a walkthrough helps more than text."],
  ["Take the quiz", "Instant scoring, with an explanation for every question."],
  ["Track your progress", "Passed units mark themselves complete and move your progress bar."],
];

export default function HomePage() {
  const { units, totalUnits } = useContent();
  const [fee, setFee] = useState(null);

  const totalHours = units.reduce((n, u) => n + (parseInt(u.duration, 10) || 0), 0);

  useEffect(() => {
    authService.classFee().then(setFee).catch(() => {});
  }, []);

  // Support /#features and /#pricing arriving from the nav.
  useEffect(() => {
    const id = window.location.hash.slice(1);
    if (!id) return;
    const el = document.getElementById(id);
    if (el) el.scrollIntoView({ behavior: "smooth", block: "start" });
  }, []);

  const months = fee ? `${fee.access_months} months` : "6 months";

  return (
    <>
      {/* ------------------------------------------------------------ hero */}
      <section className="hero">
        <div className="hero-inner">
          <span className="pill">Chapter 1 is free — no account needed</span>
          <h1 className="hero-title">
            Learn Python properly,<br />from the first line to a real project.
          </h1>
          <p className="hero-sub">
            COD26 is a {totalUnits}-unit Python course with videos, quizzes and a
            study assistant that actually knows what you are working on.
            Roughly {totalHours} hours, at your own pace.
          </p>
          <div className="hero-cta">
            <button className="btn btn-primary btn-lg" onClick={() => navigate("/unit/1")}>
              Start Chapter 1 free →
            </button>
            <button className="btn btn-ghost btn-lg" onClick={() => navigate("/courses")}>
              See all {totalUnits} units
            </button>
          </div>
          <div className="hero-stats">
            <div><strong>{totalUnits}</strong><span>units</span></div>
            <div><strong>{totalHours}</strong><span>hours</span></div>
            <div><strong>36</strong><span>quiz questions</span></div>
            <div><strong>1</strong><span>certificate</span></div>
          </div>
        </div>
      </section>

      {/* --------------------------------------------------------- what it is */}
      <section className="section">
        <div className="section-inner narrow center">
          <h2 className="section-title">What COD26 is</h2>
          <p className="lede">
            Most beginners quit Python somewhere around functions — not because it
            is hard, but because tutorials skip the part where things connect.
            COD26 is the whole path in one place: read a chapter, watch the
            walkthrough, prove it with a quiz, and move on only once it stuck.
          </p>
          <div className="steps">
            {STEPS.map(([t, d], i) => (
              <div className="step" key={t}>
                <div className="step-num">{i + 1}</div>
                <div>
                  <strong>{t}</strong>
                  <p>{d}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ------------------------------------------------------------- units */}
      <section className="section section-alt" id="courses">
        <div className="section-inner">
          <h2 className="section-title center">The {totalUnits} units</h2>
          <p className="lede center">
            Beginner to advanced, in order. Unit 1 is free for everyone.
          </p>
          <div className="unit-grid" style={{ marginTop: 26 }}>
            {units.slice(0, 6).map((u) => (
              <Link key={u.id} to={isUnitFree(u) ? `/unit/${u.id}` : "/courses"}
                className={"unit-card" + (isUnitFree(u) ? "" : " is-locked")}>
                <div className="unit-top">
                  <span className="unit-num">UNIT {u.id}</span>
                  {isUnitFree(u)
                    ? <span className="badge-free">FREE</span>
                    : <span className="unit-lock" aria-hidden="true">🔒</span>}
                </div>
                <div className="unit-title">{u.title}</div>
                <div className="unit-meta">{u.duration} · {u.difficulty}</div>
              </Link>
            ))}
          </div>
          <div className="center" style={{ marginTop: 24 }}>
            <button className="btn btn-ghost" onClick={() => navigate("/courses")}>
              View all {totalUnits} units →
            </button>
          </div>
        </div>
      </section>

      {/* ---------------------------------------------------------- features */}
      <section className="section" id="features">
        <div className="section-inner">
          <h2 className="section-title center">What you get</h2>
          <div className="feature-grid">
            {FEATURES.map(([icon, title, body]) => (
              <div className="feature" key={title}>
                <div className="feature-icon" aria-hidden="true">{icon}</div>
                <strong>{title}</strong>
                <p>{body}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ---------------------------------------------------------- benefits */}
      <section className="section section-alt" id="benefits">
        <div className="section-inner">
          <h2 className="section-title center">Why students stay</h2>
          <div className="benefit-grid">
            {BENEFITS.map(([title, body]) => (
              <div className="benefit" key={title}>
                <h3>{title}</h3>
                <p>{body}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ----------------------------------------------------------- pricing */}
      <section className="section" id="pricing">
        <div className="section-inner narrow">
          <h2 className="section-title center">Pricing</h2>
          <div className="price-grid">
            <div className="price-card">
              <h3>Free</h3>
              <div className="price">₹0</div>
              <p className="price-sub">No account needed</p>
              <ul>
                <li>✅ Unit 1, all chapters</li>
                <li>✅ Unit 1 lesson videos</li>
                <li>✅ Unit 1 quiz (sign in to save your score)</li>
                <li className="muted-li">🔒 Units 2–{totalUnits}</li>
                <li className="muted-li">🔒 Certificate &amp; leaderboard</li>
              </ul>
              <button className="btn btn-ghost btn-block" onClick={() => navigate("/unit/1")}>
                Start reading
              </button>
            </div>

            <div className="price-card price-card-main">
              <span className="pill pill-dark">Full course</span>
              <h3>Enrolled</h3>
              <div className="price">{fee ? formatFee(fee) : "₹—"}</div>
              <p className="price-sub">one payment · {months} access</p>
              <ul>
                <li>✅ All {totalUnits} units and videos</li>
                <li>✅ Every quiz, with saved scores</li>
                <li>✅ Study assistant</li>
                <li>✅ Leaderboard</li>
                <li>✅ Certificate on completion</li>
              </ul>
              <button className="btn btn-primary btn-block"
                onClick={() => navigate("/login?tab=register")}>
                Enrol now
              </button>
            </div>
          </div>

          <p className="center" style={{ marginTop: 18, color: "var(--muted)" }}>
            Got a school code?{" "}
            <Link to="/login?tab=school" className="linkbtn">Redeem it for free access →</Link>
          </p>
        </div>
      </section>

      {/* --------------------------------------------------------------- CTA */}
      <section className="cta">
        <div className="section-inner center">
          <h2>Read Chapter 1 before you decide.</h2>
          <p>It is genuinely free. No card, no signup, no countdown.</p>
          <button className="btn btn-primary btn-lg" onClick={() => navigate("/unit/1")}>
            Start Chapter 1 →
          </button>
        </div>
      </section>
    </>
  );
}
