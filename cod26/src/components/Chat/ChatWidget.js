import React, { useState, useRef, useEffect, useCallback } from "react";
import chatService from "../../services/chatService";

const MAX_CHARS = 1000;

const GREETING = {
  role: "assistant",
  key: "greeting",
  content:
    "Hi! I'm the COD26 study assistant. Ask me anything about Python or the course — " +
    "a concept you're stuck on, an error message, or how the quizzes work. " +
    "English or Hinglish, both work.",
};

/** Shown on an empty chat so students know what to ask. */
const SUGGESTIONS = [
  "Explain lists vs tuples with an example",
  "What is an IndentationError?",
  "How do the quizzes work?",
  "for loop kaise use karte hain?",
];

export default function ChatWidget() {
  const [open, setOpen] = useState(false);
  const [messages, setMessages] = useState([GREETING]);
  const [draft, setDraft] = useState("");
  const [busy, setBusy] = useState(false);
  const [err, setErr] = useState("");
  const [retry, setRetry] = useState(null);
  const [phase, setPhase] = useState("idle"); // idle | loading | ready | failed

  const scroller = useRef(null);
  const inputRef = useRef(null);
  const idRef = useRef(0);
  const nextId = () => "m" + ++idRef.current;

  const loadHistory = useCallback(async () => {
    setPhase("loading");
    try {
      const rows = await chatService.history();
      setMessages(rows.length ? [GREETING, ...rows] : [GREETING]);
      setPhase("ready");
    } catch {
      // History is a nicety - a fresh chat still works, so don't block on it.
      setPhase("failed");
    }
  }, []);

  // Fetch on first open rather than page load - most students never open it.
  useEffect(() => {
    if (open && phase === "idle") loadHistory();
  }, [open, phase, loadHistory]);

  // Pin to the newest message as the conversation grows.
  useEffect(() => {
    const el = scroller.current;
    if (el) el.scrollTop = el.scrollHeight;
  }, [messages, busy, open]);

  useEffect(() => {
    if (open) inputRef.current?.focus();
  }, [open]);

  // Grow the composer with the text, up to the CSS max-height.
  useEffect(() => {
    const el = inputRef.current;
    if (!el) return;
    el.style.height = "auto";
    el.style.height = Math.min(el.scrollHeight, 96) + "px";
  }, [draft]);

  const ask = useCallback(async (text) => {
    const question = text.trim();
    if (!question || busy) return;

    setErr("");
    setRetry(null);
    setDraft("");
    setMessages((m) => [...m, { role: "user", content: question, key: nextId() }]);
    setBusy(true);
    try {
      const reply = await chatService.send(question);
      setMessages((m) => [...m, { role: "assistant", content: reply, key: nextId() }]);
    } catch (e) {
      setErr(e.message || "Could not reach the assistant.");
      // Keep the question so one tap can retry it.
      setRetry(question);
    } finally {
      setBusy(false);
      inputRef.current?.focus();
    }
  }, [busy]);

  function onKeyDown(e) {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      ask(draft);
    }
    if (e.key === "Escape") setOpen(false);
  }

  if (!open) {
    return (
      <button className="chat-fab" onClick={() => setOpen(true)}
        aria-label="Open the COD26 study assistant">
        <span aria-hidden="true">💬</span>
      </button>
    );
  }

  const isEmpty = messages.length === 1 && phase !== "loading";
  const remaining = MAX_CHARS - draft.length;

  return (
    <div className="chat-panel" role="dialog" aria-label="COD26 study assistant">
      <div className="chat-head">
        <div>
          <strong>COD26 Assistant</strong>
          <div className="chat-head-sub">Ask anything about Python or the course</div>
        </div>
        <button className="chat-close" onClick={() => setOpen(false)} aria-label="Close chat">✕</button>
      </div>

      <div className="chat-body" ref={scroller} aria-live="polite" aria-atomic="false">
        {phase === "loading" && <div className="chat-note">Loading your chat…</div>}

        {messages.map((m) => (
          <div key={m.key ?? m.id} className={"bubble bubble-" + m.role}>
            {m.content}
          </div>
        ))}

        {isEmpty && (
          <div className="chat-suggest">
            <div className="chat-suggest-label">Try asking</div>
            {SUGGESTIONS.map((s) => (
              <button key={s} className="chat-chip" disabled={busy} onClick={() => ask(s)}>
                {s}
              </button>
            ))}
          </div>
        )}

        {busy && (
          <div className="bubble bubble-assistant chat-typing" aria-label="Assistant is typing">
            <span className="dot" /><span className="dot" /><span className="dot" />
          </div>
        )}

        {err && (
          <div className="error chat-error">
            <div>{err}</div>
            {retry && (
              <button className="btn btn-ghost btn-sm" style={{ marginTop: 8 }}
                onClick={() => ask(retry)}>
                Retry
              </button>
            )}
          </div>
        )}
      </div>

      <div className="chat-foot">
        <textarea
          ref={inputRef}
          rows={1}
          value={draft}
          onChange={(e) => setDraft(e.target.value.slice(0, MAX_CHARS))}
          onKeyDown={onKeyDown}
          placeholder="Ask a question…"
          aria-label="Your question"
          maxLength={MAX_CHARS}
          disabled={busy}
        />
        <button className="btn btn-primary chat-send" onClick={() => ask(draft)}
          disabled={busy || !draft.trim()} aria-label="Send question">
          {busy ? "…" : "Send"}
        </button>
      </div>

      {remaining < 120 && (
        <div className="chat-count">{remaining} characters left</div>
      )}
    </div>
  );
}
