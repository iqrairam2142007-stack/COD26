import React, { useState, useEffect, useRef, useCallback } from "react";
import studentService from "../../services/studentService";

const box = { background: "#fff", borderRadius: 14, padding: 26, boxShadow: "var(--shadow)", maxWidth: 760 };
const QUIZ_SECONDS = 30 * 60;

export default function Quiz({ unitId, onBack, onDone, onUnits }) {
  const [quiz, setQuiz] = useState(null);
  const [qi, setQi] = useState(0);
  const [answers, setAnswers] = useState({});
  const [time, setTime] = useState(QUIZ_SECONDS);
  const [result, setResult] = useState(null);
  const [loading, setLoading] = useState(false);
  const [err, setErr] = useState("");
  const startedAt = useRef(0);
  const submitted = useRef(false);
  // Lets the countdown submit the latest answers without re-arming the interval.
  const latest = useRef({ quiz: null, answers: {} });
  latest.current = { quiz, answers };

  const submit = useCallback(async () => {
    if (submitted.current) return;
    const { quiz: q, answers: a } = latest.current;
    if (!q) return;
    submitted.current = true;
    const ans = q.questions.map((_, i) => (i in a ? a[i] : null));
    const taken = Math.round((Date.now() - startedAt.current) / 1000);
    try {
      const r = await studentService.submitQuiz(unitId, ans, taken);
      setResult(r.result);
      onDone && onDone();
    } catch (e) {
      setErr(e.message);
      submitted.current = false;
    }
  }, [unitId, onDone]);

  // Countdown runs only while a quiz is open and unsubmitted.
  useEffect(() => {
    if (!quiz || result) return undefined;
    const id = setInterval(() => {
      setTime((t) => (t <= 1 ? 0 : t - 1));
    }, 1000);
    return () => clearInterval(id);
  }, [quiz, result]);

  useEffect(() => {
    if (quiz && !result && time === 0) submit();
  }, [time, quiz, result, submit]);

  async function start() {
    setLoading(true);
    setErr("");
    try {
      const r = await studentService.startQuiz(unitId);
      setQuiz(r.quiz);
      setAnswers({});
      setQi(0);
      setTime(QUIZ_SECONDS);
      submitted.current = false;
      startedAt.current = Date.now();
    } catch (e) {
      setErr(e.message);
    } finally {
      setLoading(false);
    }
  }

  const fmt = (s) => Math.floor(s / 60) + ":" + String(s % 60).padStart(2, "0");

  if (!quiz && !result) {
    return (
      <div style={box}>
        <h2>Unit Quiz</h2>
        <p style={{ color: "var(--muted)", margin: "6px 0 14px" }}>30 min · pass 60% · instant feedback</p>
        {err && <div className="error">{err}</div>}
        <button className="btn btn-ghost" style={{ marginRight: 8 }} onClick={onBack}>← Back</button>
        <button className="btn btn-primary" disabled={loading} onClick={start}>{loading ? "Loading..." : "🎯 Start Quiz"}</button>
      </div>
    );
  }

  if (result) {
    return (
      <div style={box}>
        <h2 style={{ textAlign: "center" }}>Quiz Complete! 🎉</h2>
        <div style={{ width: 120, height: 120, borderRadius: "50%", margin: "14px auto", color: "#fff",
          display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center",
          background: "linear-gradient(135deg,var(--orange),var(--orange2))" }}>
          <div style={{ fontSize: "2rem", fontWeight: 800 }}>{result.percentage}%</div><div>Score</div>
        </div>
        <p style={{ textAlign: "center" }}>{result.correctAnswers}/{result.totalQuestions} correct ·
          <span style={{ marginLeft: 6, padding: "3px 10px", borderRadius: 999, color: "#fff", fontWeight: 700,
            background: result.passed ? "var(--green)" : "var(--red)" }}>{result.passed ? "PASSED" : "FAILED"}</span></p>
        <div style={{ marginTop: 14 }}>
          {result.detailedResults.map((d, i) => (
            <div key={i} style={{ borderLeft: "4px solid " + (d.isCorrect ? "var(--green)" : "var(--red)"),
              padding: "10px 14px", borderRadius: 8, margin: "8px 0", background: "#fafafa", fontSize: ".88rem" }}>
              <strong>Q{i + 1}. {d.question}</strong><br />Your answer: {d.studentAnswer || "(not answered)"}
              {!d.isCorrect && <><br />Correct: <strong>{d.correctAnswer}</strong></>}
              <br /><em>{d.explanation}</em>
            </div>
          ))}
        </div>
        <div style={{ textAlign: "center", marginTop: 14 }}>
          <button className="btn btn-ghost" style={{ marginRight: 8 }}
            onClick={() => { setResult(null); setQuiz(null); submitted.current = false; }}>🔄 Retake</button>
          <button className="btn btn-primary" onClick={onUnits}>📚 More Units</button>
        </div>
      </div>
    );
  }

  const q = quiz.questions[qi];
  return (
    <div style={box}>
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
        <strong>Question {qi + 1}/{quiz.questions.length}</strong>
        <span style={{ fontWeight: 700, color: time < 300 ? "var(--red)" : "var(--orange)" }}>⏱ {fmt(time)}</span>
      </div>
      <div style={{ height: 8, background: "#eee", borderRadius: 99, overflow: "hidden", margin: "8px 0" }}>
        <div style={{ height: "100%", width: ((qi + 1) / quiz.questions.length * 100) + "%",
          background: "linear-gradient(90deg,var(--orange),var(--orange2))" }} />
      </div>
      <h3 style={{ margin: "14px 0" }}>{q.question}</h3>
      {err && <div className="error">{err}</div>}
      {q.options.map((o, i) => {
        const sel = answers[qi] === o;
        return (
          <button key={i} onClick={() => setAnswers({ ...answers, [qi]: o })}
            style={{ display: "block", width: "100%", textAlign: "left", padding: "13px 16px",
              border: "2px solid " + (sel ? "var(--orange)" : "var(--border)"), borderRadius: 10,
              background: sel ? "var(--light)" : "#fff", margin: "9px 0", fontSize: ".95rem" }}>
            {String.fromCharCode(65 + i)}) {o}
          </button>
        );
      })}
      <div style={{ display: "flex", justifyContent: "space-between", marginTop: 14 }}>
        <button className="btn btn-ghost" disabled={qi === 0} onClick={() => setQi(qi - 1)}>← Previous</button>
        {qi < quiz.questions.length - 1
          ? <button className="btn btn-primary" onClick={() => setQi(qi + 1)}>Next →</button>
          : <button className="btn btn-primary" onClick={submit}>✓ Submit Quiz</button>}
      </div>
    </div>
  );
}
