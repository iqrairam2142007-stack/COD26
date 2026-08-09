import React, { useState, useEffect } from "react";
import attendanceService from "../../services/attendanceService";
import adminService from "../../services/adminService";

const RANGES = [7, 30, 90];

export default function AttendanceReport() {
  const [days, setDays] = useState(30);
  const [data, setData] = useState(null);
  const [names, setNames] = useState({});
  const [err, setErr] = useState("");

  useEffect(() => {
    setData(null);
    attendanceService.report({ days }).then(setData).catch((e) => setErr(e.message));
  }, [days]);

  useEffect(() => {
    adminService
      .students({})
      .then((r) => {
        const map = {};
        (r.students || []).forEach((s) => { map[s.uid] = s; });
        setNames(map);
      })
      .catch(() => {});
  }, []);

  if (err) return <div className="error">{err}</div>;
  if (!data) return <div className="loading">Loading attendance…</div>;

  const peak = Math.max(1, ...Object.values(data.byDay));
  const dayList = Object.entries(data.byDay).sort((a, b) => a[0].localeCompare(b[0]));
  const perStudent = Object.entries(data.byUser).sort((a, b) => b[1] - a[1]);

  return (
    <>
      <h2 className="page-title">📅 Attendance</h2>
      <p className="page-sub">A student counts for a day once they open their dashboard.</p>

      <div className="tabs" style={{ maxWidth: 320, margin: "14px 0" }}>
        {RANGES.map((r) => (
          <button key={r} className={"tab" + (days === r ? " is-active" : "")}
            onClick={() => setDays(r)}>{r} days</button>
        ))}
      </div>

      <div className="stat-row">
        <div className="stat-tile">
          <div className="stat-num">{data.activeStudents}</div>
          <div className="stat-label">active students</div>
        </div>
        <div className="stat-tile">
          <div className="stat-num">{data.rows.length}</div>
          <div className="stat-label">student-days</div>
        </div>
        <div className="stat-tile">
          <div className="stat-num">{dayList.length}</div>
          <div className="stat-label">days with activity</div>
        </div>
      </div>

      {dayList.length === 0 && (
        <div className="notice" style={{ marginTop: 16 }}>
          No attendance recorded in this range yet.
        </div>
      )}

      {dayList.length > 0 && (
        <>
          <h3 style={{ fontSize: "1.05rem", marginTop: 22 }}>Daily</h3>
          <div className="bars">
            {dayList.map(([day, count]) => (
              <div key={day} className="bar-row">
                <span className="bar-label">{day.slice(5)}</span>
                <span className="bar-track">
                  <span className="bar-fill" style={{ width: (count / peak) * 100 + "%" }} />
                </span>
                <span className="bar-num">{count}</span>
              </div>
            ))}
          </div>

          <h3 style={{ fontSize: "1.05rem", marginTop: 22 }}>Per student</h3>
          <div className="table-wrap">
            <table style={{ width: "100%", borderCollapse: "collapse", background: "var(--surface)",
              borderRadius: 12, overflow: "hidden" }}>
              <thead>
                <tr>{["Student", "School", "Days present", "Rate"].map((h) => (
                  <th key={h} style={{ background: "var(--surface2)", color: "var(--orange)", textAlign: "left",
                    padding: 12, fontSize: ".9rem", whiteSpace: "nowrap", fontWeight: 700 }}>{h}</th>
                ))}</tr>
              </thead>
              <tbody>
                {perStudent.map(([uid, count]) => (
                  <tr key={uid}>
                    <td style={cell}>{names[uid]?.name || uid.slice(0, 8) + "…"}</td>
                    <td style={cell}>{names[uid]?.school || "—"}</td>
                    <td style={cell}>{count}</td>
                    <td style={cell}>{Math.round((count / days) * 100)}%</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </>
      )}
    </>
  );
}

const cell = { padding: 12, borderBottom: "1px solid var(--border)", fontSize: ".95rem", whiteSpace: "nowrap" };
