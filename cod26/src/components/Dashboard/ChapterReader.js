import React, { useState, useEffect, useCallback } from "react";
import { useAuth } from "../../context/AuthContext";
import { useContent } from "../../context/ContentContext";
import contentService from "../../services/contentService";
import progressService from "../../services/progressService";
import { canOpenUnit, canTakeQuiz, isUnitFree } from "../../config/access";
import UnitVideos from "./UnitVideos";
import UnitResources from "./UnitResources";
import CodeBlock from "./CodeBlock";

/**
 * One chapter at a time, with navigation that runs continuously through the
 * whole course rather than stopping at the end of each unit.
 *
 * Every chapter uses the same frame - rail, title, body, footer nav - so the
 * course feels like one thing. What appears *inside* that frame varies with
 * what the unit actually has: key points open a unit, the worked example,
 * discussion question and assignment close it, and videos or resources appear
 * only where an admin has attached them.
 */
export default function ChapterReader({
  unitId,
  chapterIndex = 0,
  tier = "full",
  onBack,
  onQuiz,
  onExit,
  onUnlock,
  onNavigate,
  backLabel = "← All Units",
}) {
  const { profile } = useAuth();
  const { getUnit, units, loading: catalogueLoading } = useContent();
  const unit = getUnit(unitId);

  const [chapters, setChapters] = useState(null);
  const [extra, setExtra] = useState(null); // worked example + discussion question
  const [err, setErr] = useState("");
  const [done, setDone] = useState(new Set());
  const [saving, setSaving] = useState(false);

  const allowed = canOpenUnit(tier, unit);

  useEffect(() => {
    if (!unit || !allowed) return undefined;
    let cancelled = false;
    setChapters(null);
    setExtra(null);
    contentService
      .chapters(unit.id)
      .then((rows) => { if (!cancelled) setChapters(rows); })
      .catch((e) => { if (!cancelled) { setErr(e.message); setChapters([]); } });
    // Gated separately from the unit row, so it gets its own fetch.
    contentService
      .unitContent(unit.id)
      .then((row) => { if (!cancelled) setExtra(row); })
      .catch(() => { if (!cancelled) setExtra(null); });
    return () => { cancelled = true; };
  }, [unit, allowed]);

  const loadProgress = useCallback(async () => {
    if (!profile) return;
    try {
      const p = await progressService.chapters(profile.id);
      setDone(p.done);
    } catch {
      /* reading still works without the ticks */
    }
  }, [profile]);

  useEffect(() => { loadProgress(); }, [loadProgress]);

  if (catalogueLoading) return <div className="loading">Loading unit…</div>;

  if (!unit) {
    return (
      <div className="card">
        <button className="btn btn-ghost" onClick={onBack}>{backLabel}</button>
        <p style={{ marginTop: 12 }}>Unit {unitId} was not found.</p>
      </div>
    );
  }

  // Defensive: the grid hides locked units, but never render paid content
  // because a caller passed the wrong id. RLS returns no chapters anyway.
  if (!allowed) {
    return (
      <div className="card">
        <button className="btn btn-ghost" onClick={onBack}>{backLabel}</button>
        <h2 className="page-title" style={{ marginTop: 14 }}>🔒 {unit.title} is locked</h2>
        <p className="page-sub">Enrol to unlock all units, quizzes and your certificate.</p>
        <button className="btn btn-primary" onClick={tier === "guest" ? onExit : onUnlock}>
          {tier === "guest" ? "Sign in / Enrol" : "Unlock all units"}
        </button>
      </div>
    );
  }

  if (chapters === null) return <div className="loading">Loading chapters…</div>;

  if (!chapters.length) {
    return (
      <div className="card card-reader">
        <button className="btn btn-ghost" style={{ marginBottom: 14 }} onClick={onBack}>{backLabel}</button>
        <h2 className="page-title">{unit.title}</h2>
        {err ? <div className="error">{err}</div>
             : <p className="page-sub">No chapters have been added to this unit yet.</p>}
      </div>
    );
  }

  // -1 means "the last chapter", used when stepping backwards into the
  // previous unit so the student lands where they left off, not at its start.
  const safeIdx =
    chapterIndex < 0
      ? chapters.length - 1
      : Math.min(chapterIndex, chapters.length - 1);
  const chapter = chapters[safeIdx];
  const isFirst = safeIdx === 0;
  const isLast = safeIdx === chapters.length - 1;
  const quizAllowed = canTakeQuiz(tier, unit);
  const chapterDone = done.has(chapter.id);

  // Where the course goes next, across unit boundaries.
  const ordered = [...units].sort((a, b) => a.position - b.position);
  const here = ordered.findIndex((u) => u.id === unit.id);
  const prevUnit = here > 0 ? ordered[here - 1] : null;
  const nextUnit = here >= 0 && here < ordered.length - 1 ? ordered[here + 1] : null;
  const nextUnitOpen = nextUnit && canOpenUnit(tier, nextUnit);

  async function markDone() {
    if (!profile || chapterDone) return;
    setSaving(true);
    try {
      await progressService.completeChapter(profile.id, chapter);
      setDone((d) => new Set([...d, chapter.id]));
    } catch (e) {
      setErr(e.message);
    } finally {
      setSaving(false);
    }
  }

  async function completeAndContinue() {
    await markDone();
    if (!isLast) return onNavigate(unit.id, safeIdx + 1);
    if (nextUnitOpen) return onNavigate(nextUnit.id, 0);
  }

  function goPrev() {
    if (!isFirst) return onNavigate(unit.id, safeIdx - 1);
    if (prevUnit && canOpenUnit(tier, prevUnit)) {
      // Land on the previous unit's last chapter, not its first.
      return onNavigate(prevUnit.id, -1);
    }
  }

  const hasPrev = !isFirst || (prevUnit && canOpenUnit(tier, prevUnit));
  const doneInUnit = chapters.filter((c) => done.has(c.id)).length;
  const isCommandExample = /^#\s*Terminal/i.test(extra?.code_example || "");

  return (
    <article className="card card-reader chapter">
      <button className="btn btn-ghost" style={{ marginBottom: 14 }} onClick={onBack}>{backLabel}</button>

      {/* ------------------------------------------------ unit header */}
      <header className="chapter-head">
        <div className="chapter-eyebrow">
          <span>Unit {here + 1} of {ordered.length}</span>
          {isUnitFree(unit) && tier !== "full" && <span className="badge-free">FREE</span>}
        </div>
        <h2 className="page-title">{unit.title}</h2>
        <p className="page-sub">
          {unit.duration} · {unit.difficulty} · {chapters.length} chapters
          {profile && ` · ${doneInUnit}/${chapters.length} read`}
        </p>
        <div className="progress-track" style={{ maxWidth: 320, margin: "10px 0 0" }}>
          <div className="progress-fill"
            style={{ width: (doneInUnit / chapters.length) * 100 + "%" }} />
        </div>
      </header>

      {/* ------------------------------------------------ chapter rail */}
      <nav className="chapter-rail" aria-label="Chapters in this unit">
        {chapters.map((c, i) => (
          <button key={c.id}
            className={"chapter-chip" +
              (i === safeIdx ? " is-active" : "") +
              (done.has(c.id) ? " is-done" : "")}
            aria-current={i === safeIdx ? "step" : undefined}
            title={c.title}
            onClick={() => onNavigate(unit.id, i)}>
            {done.has(c.id) && i !== safeIdx ? "✓" : "Ch " + (i + 1)}
          </button>
        ))}
      </nav>

      {err && <div className="error" style={{ marginTop: 12 }}>{err}</div>}

      {/* --------------------------------- key points open a unit */}
      {isFirst && unit.highlights?.length > 0 && (
        <section className="keypoints" aria-label="What this unit covers">
          <h3 className="section-label">What this unit covers</h3>
          <ul>
            {unit.highlights.map((h) => <li key={h}>{h}</li>)}
          </ul>
        </section>
      )}

      {/* ------------------------------------------- chapter content */}
      <h3 className="reader-heading">Chapter {safeIdx + 1}: {chapter.title}</h3>
      <div className="reader-body">{chapter.content}</div>

      {/* Videos and resources appear wherever an admin attached them. */}
      <UnitVideos unitId={unit.id} />
      <UnitResources unitId={unit.id} />

      {/* ------------------------- worked example closes the unit */}
      {isLast && extra?.code_example && (
        <section className="example">
          <h3 className="section-label">
            {isCommandExample ? "💻 Commands to run" : "💡 Worked example"}
          </h3>
          <CodeBlock code={extra?.code_example}
            language={isCommandExample ? "bash" : "python"} />
        </section>
      )}

      {isLast && extra?.quiz_prompt && (
        <section className="think">
          <h3 className="section-label">🤔 Think about it</h3>
          <p>{extra?.quiz_prompt}</p>
          <p className="page-sub" style={{ fontSize: ".88rem", marginTop: 6 }}>
            Not sure? Ask the study assistant — the 💬 button, bottom right.
          </p>
        </section>
      )}

      {isLast && unit.assignment_title && (
        <section className="assignment">
          <strong>📝 Assignment</strong>
          <div style={{ marginTop: 4 }}>{unit.assignment_title}</div>
          <div className="assignment-meta">
            Complete within {unit.assignment_deadline_days} days · {unit.assignment_points} points
          </div>
        </section>
      )}

      {/* ---------------------------------------------- footer nav */}
      <footer className="reader-nav">
        <button className="btn btn-ghost" disabled={!hasPrev} onClick={goPrev}>
          ← {isFirst && prevUnit ? "Previous unit" : "Previous"}
        </button>

        <span className="reader-count">Chapter {safeIdx + 1} of {chapters.length}</span>

        {isLast ? (
          quizAllowed ? (
            <button className="btn btn-primary" onClick={onQuiz}>Take Quiz →</button>
          ) : (
            <button className="btn btn-primary" onClick={onExit}>Sign in to take the quiz</button>
          )
        ) : (
          <button className="btn btn-primary" disabled={saving} onClick={completeAndContinue}>
            {saving ? "Saving…" : "Next chapter →"}
          </button>
        )}
      </footer>

      {/* Completion is explicit so a student can mark a chapter read without
          being forced through the quiz. Guests have no account to save to. */}
      {profile && (
        <div className="chapter-done-row">
          {chapterDone ? (
            <span className="done-flag">✓ Chapter complete</span>
          ) : (
            <button className="btn btn-ghost btn-sm" disabled={saving} onClick={markDone}>
              Mark this chapter complete
            </button>
          )}
          {isLast && nextUnit && (
            nextUnitOpen ? (
              <button className="btn btn-ghost btn-sm" onClick={() => onNavigate(nextUnit.id, 0)}>
                Next unit: {nextUnit.title} →
              </button>
            ) : (
              <button className="btn btn-ghost btn-sm" onClick={onUnlock}>
                🔒 Next unit needs enrolment
              </button>
            )
          )}
          {isLast && !nextUnit && (
            <span className="done-flag">🎉 Last unit of the course</span>
          )}
        </div>
      )}
    </article>
  );
}
