import React, { useState, useEffect } from "react";
import { useAuth } from "../../context/AuthContext";
import attendanceService from "../../services/attendanceService";

const DAY_MS = 86400000;
const iso = (d) => d.toISOString().slice(0, 10);
const WEEKDAYS = ["M", "T", "W", "T", "F", "S", "S"];

/** Last 12 weeks, oldest first, aligned so each column is one week. */
function buildGrid(weeks = 12) {
  const today = new Date();
  // Walk back to the most recent Monday so columns line up.
  const dow = (today.getDay() + 6) % 7;
  const end = new Date(today.getTime() - dow * DAY_MS + 6 * DAY_MS);
  const cells = [];
  for (let i = weeks * 7 - 1; i >= 0; i--) {
    cells.push(new Date(end.getTime() - i * DAY_MS));
  }
  return cells;
}

export default function Attendance() {
  const { profile } = useAuth();
  const [data, setData] = useState(null);
  const [err, setErr] = useState("");

  useEffect(() => {
    if (!profile) return;
    attendanceService
      .mine(profile.id)
      .then(setData)
      .catch((e) => setErr(e.message));
  }, [profile]);

  if (err) return <div className="error">{err}</div>;
  if (!data) return <div className="loading">Loading attendance…</div>;

  const present = new Set(data.days);
  const cells = buildGrid();
  const todayIso = iso(new Date());

  return (
    <>
      <h2 className="page-title">📅 My attendance</h2>
      <p className="page-sub">
        A day counts once you open your dashboard and study. Twelve weeks shown.
      </p>

      <div className="stat-row">
        <div className="stat-tile">
          <div className="stat-num">{data.streak}</div>
          <div className="stat-label">day streak</div>
        </div>
        <div className="stat-tile">
          <div className="stat-num">{data.totalDays}</div>
          <div className="stat-label">days studied</div>
        </div>
        <div className="stat-tile">
          <div className="stat-num">{present.has(todayIso) ? "✓" : "—"}</div>
          <div className="stat-label">today</div>
        </div>
      </div>

      <div className="card" style={{ marginTop: 18, maxWidth: 620 }}>
        <div className="heat-wrap">
          <div className="heat-days" aria-hidden="true">
            {WEEKDAYS.map((d, i) => <span key={i}>{d}</span>)}
          </div>
          <div className="heatmap" role="img"
            aria-label={`${data.totalDays} days studied in the last twelve weeks`}>
            {cells.map((d) => {
              const key = iso(d);
              const on = present.has(key);
              const future = d > new Date();
              return (
                <span key={key}
                  className={"heat-cell" + (on ? " is-on" : "") + (future ? " is-future" : "")}
                  title={`${key}${on ? " — studied" : ""}`} />
              );
            })}
          </div>
        </div>
        <p className="page-sub" style={{ marginTop: 12 }}>
          <span className="heat-cell is-on" style={{ display: "inline-block", verticalAlign: "-2px" }} />
          {" "}studied · <span className="heat-cell" style={{ display: "inline-block", verticalAlign: "-2px" }} /> no activity
        </p>
      </div>
    </>
  );
}
