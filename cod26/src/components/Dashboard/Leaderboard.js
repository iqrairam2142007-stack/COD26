import React, { useState, useEffect } from "react";
import { useAuth } from "../../context/AuthContext";
import studentService from "../../services/studentService";

const td = { padding: 12, borderBottom: "1px solid #f1e7d6", fontSize: ".95rem", whiteSpace: "nowrap" };
const th = { background: "var(--orange)", color: "#fff", textAlign: "left", padding: 12, fontSize: ".9rem", whiteSpace: "nowrap" };

export default function Leaderboard() {
  const { profile } = useAuth();
  const [board, setBoard] = useState([]);
  const [scope, setScope] = useState("global");

  useEffect(() => {
    const q = {};
    if (scope === "school") q.schoolId = profile?.school;
    studentService.leaderboard(q).then((r) => setBoard(r.leaderboard || [])).catch(() => setBoard([]));
  }, [scope, profile]);

  return (
    <>
      <h2 className="page-title">🏆 Leaderboard</h2>
      <p className="page-sub">Sorted by score, then fastest time</p>
      <div style={{ margin: "12px 0" }}>
        <select value={scope} onChange={(e) => setScope(e.target.value)} style={{ maxWidth: 220 }}>
          <option value="global">Global</option>
          <option value="school">My School</option>
        </select>
      </div>
      {board.length === 0 ? (
        <div className="notice">No scores yet - take a quiz to appear here!</div>
      ) : (
        <div className="table-wrap">
        <table style={{ width: "100%", borderCollapse: "collapse", background: "#fff",
          borderRadius: 12, overflow: "hidden", boxShadow: "0 2px 10px rgba(0,0,0,.05)" }}>
          <thead><tr>{["Rank", "Student", "School", "Unit", "Score", "Time"].map((h) =>
            <th key={h} style={th}>{h}</th>)}</tr></thead>
          <tbody>
            {board.map((e, i) => {
              const me = e.user_id === profile?.id;
              const medal = i === 0 ? "🥇" : i === 1 ? "🥈" : i === 2 ? "🥉" : "#" + (i + 1);
              return (
                <tr key={e.id || i} style={{ background: me ? "#fff3e0" : i % 2 ? "#fffaf3" : "#fff", fontWeight: me ? 600 : 400 }}>
                  <td style={td}>{medal}</td>
                  <td style={td}>{e.student_name}{me ? " (You)" : ""}</td>
                  <td style={td}>{e.school}</td>
                  <td style={td}>Unit {e.unit_id}</td>
                  <td style={td}>{e.percentage}%</td>
                  <td style={td}>{Math.floor(e.time_taken / 60)}:{String(e.time_taken % 60).padStart(2, "0")}</td>
                </tr>
              );
            })}
          </tbody>
        </table>
        </div>
      )}
    </>
  );
}
