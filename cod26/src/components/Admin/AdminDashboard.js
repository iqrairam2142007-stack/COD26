import React, { useState, useEffect } from "react";
import { useAuth } from "../../context/AuthContext";
import adminService from "../../services/adminService";
import VideoManager from "./VideoManager";
import ContentManager from "./ContentManager";
import ResourceManager from "./ResourceManager";
import Announcements from "./Announcements";
import AttendanceReport from "./AttendanceReport";
import { Link, navigate } from "../../lib/router";

const td = { padding: 11, borderBottom: "1px solid #f1e7d6", fontSize: ".88rem" };
const th = { background: "var(--orange)", color: "#fff", textAlign: "left", padding: 11, fontSize: ".85rem" };
const tableStyle = { width: "100%", borderCollapse: "collapse", background: "#fff", borderRadius: 12,
  overflow: "hidden", boxShadow: "0 2px 10px rgba(0,0,0,.05)" };

export default function AdminDashboard() {
  const { profile, logout } = useAuth();
  const [view, setView] = useState("dash");
  const items = [
    ["dash", "📊 Dashboard"],
    ["content", "📘 Units & Chapters"],
    ["videos", "🎬 Videos"],
    ["resources", "📎 Resources"],
    ["students", "👥 Students"],
    ["attendance", "📅 Attendance"],
    ["announce", "🔔 Announcements"],
    ["activity", "📈 Activity"],
    ["codes", "🏫 School Codes"],
  ];

  return (
    <div>
      <header className="topbar">
        <Link to="/" className="brand">
          <span className="brand-mark">C26</span>
          <span>COD26 Admin</span>
        </Link>
        <div className="topbar-right">
          <span className="topbar-name">{profile?.name}</span>
          <button className="btn btn-primary btn-sm"
            onClick={async () => { await logout(); navigate("/"); }}>Logout</button>
        </div>
      </header>
      <div className="shell">
        <nav className="sidebar">
          {items.map(([k, l]) => (
            <button key={k} className={"navitem" + (view === k ? " is-active" : "")}
              onClick={() => setView(k)}>{l}</button>
          ))}
        </nav>
        <main className="content">
          {view === "dash" && <Dash />}
          {view === "students" && <Students />}
          {view === "activity" && <Activity />}
          {view === "codes" && <Codes />}
          {view === "videos" && <VideoManager />}
          {view === "content" && <ContentManager />}
          {view === "resources" && <ResourceManager />}
          {view === "announce" && <Announcements />}
          {view === "attendance" && <AttendanceReport />}
        </main>
      </div>
    </div>
  );
}

function Stat({ n, l, ic }) {
  return (
    <div style={{ background: "#fff", borderRadius: 14, padding: 20, boxShadow: "0 2px 10px rgba(0,0,0,.05)", border: "1px solid var(--border)" }}>
      <div style={{ fontSize: "1.3rem" }}>{ic}</div>
      <div style={{ fontSize: "2rem", fontWeight: 800, color: "var(--orange)" }}>{n}</div>
      <div style={{ color: "var(--muted)", fontSize: ".85rem" }}>{l}</div>
    </div>
  );
}

function Dash() {
  const [d, setD] = useState(null);
  useEffect(() => { adminService.dashboard().then((r) => setD(r.dashboard)).catch(() => {}); }, []);
  if (!d) return <div className="loading">Loading...</div>;
  const o = d.overview;
  return (
    <>
      <h2 style={{ fontSize: "1.6rem" }}>Admin Dashboard</h2>
      <p style={{ color: "var(--muted)" }}>Live platform overview</p>
      <div style={{ display: "grid", gap: 16, gridTemplateColumns: "repeat(auto-fit,minmax(170px,1fr))", margin: "16px 0" }}>
        <Stat n={o.totalStudents} l="Total Students" ic="👥" />
        <Stat n={o.activeSubscriptions} l="Active Access" ic="✅" />
        <Stat n={o.pendingSubscriptions} l="Pending" ic="⏳" />
        <Stat n={"₹" + d.revenue.totalRevenue} l="Revenue" ic="💰" />
        <Stat n={o.directStudents} l="Direct" ic="💳" />
        <Stat n={o.schoolStudents} l="School" ic="🏫" />
        <Stat n={o.todayActivities} l="Activities Today" ic="📈" />
      </div>
      <h3 style={{ margin: "8px 0" }}>Recent Logins</h3>
      <table style={tableStyle}>
        <thead><tr>{["Student", "School", "Device", "Time"].map((x) => <th key={x} style={th}>{x}</th>)}</tr></thead>
        <tbody>
          {(d.recentLogins || []).map((l, i) => (
            <tr key={i}><td style={td}>{l.studentName}</td><td style={td}>{l.school}</td>
              <td style={td}>{l.deviceType}</td><td style={td}>{new Date(l.timestamp).toLocaleString()}</td></tr>
          ))}
          {(!d.recentLogins || !d.recentLogins.length) && <tr><td style={td} colSpan={4}>No logins yet</td></tr>}
        </tbody>
      </table>
    </>
  );
}

function Students() {
  const [list, setList] = useState([]);
  const [q, setQ] = useState({ searchTerm: "", subscriptionStatus: "", accountType: "" });
  const [logs, setLogs] = useState(null);

  useEffect(() => {
    adminService.students(q).then((r) => setList(r.students)).catch(() => {});
  }, [q]);

  async function showLogs(u) {
    const r = await adminService.studentLogs(u.uid);
    setLogs({ name: u.name, items: r.activities });
  }

  return (
    <>
      <h2 style={{ fontSize: "1.6rem" }}>Student Management</h2>
      <div style={{ display: "flex", gap: 10, flexWrap: "wrap", margin: "14px 0" }}>
        <input placeholder="Search name / email / phone" style={{ maxWidth: 280 }}
          value={q.searchTerm} onChange={(e) => setQ({ ...q, searchTerm: e.target.value })} />
        <select style={{ maxWidth: 170 }} value={q.subscriptionStatus}
          onChange={(e) => setQ({ ...q, subscriptionStatus: e.target.value })}>
          <option value="">All status</option><option value="active">Active</option><option value="pending">Pending</option></select>
        <select style={{ maxWidth: 170 }} value={q.accountType}
          onChange={(e) => setQ({ ...q, accountType: e.target.value })}>
          <option value="">All types</option><option value="direct">Direct</option><option value="school">School</option></select>
      </div>
      <table style={tableStyle}>
        <thead><tr>{["Name", "Email", "Phone", "School", "Type", "Access", "Progress", ""].map((x) => <th key={x} style={th}>{x}</th>)}</tr></thead>
        <tbody>
          {list.map((u) => (
            <tr key={u.uid}>
              <td style={td}>{u.name}</td><td style={td}>{u.email}</td><td style={td}>{u.phone}</td>
              <td style={td}>{u.school}</td><td style={td}>{u.accountType}</td><td style={td}>{u.subscriptionStatus}</td>
              <td style={td}>{(u.progress && u.progress.totalProgress) || 0}%</td>
              <td style={td}><button className="btn btn-ghost" style={{ padding: "5px 10px" }} onClick={() => showLogs(u)}>📊 Logs</button></td>
            </tr>
          ))}
          {!list.length && <tr><td style={td} colSpan={8}>No students match</td></tr>}
        </tbody>
      </table>

      {logs && (
        <div onClick={() => setLogs(null)} style={{ position: "fixed", inset: 0, background: "rgba(0,0,0,.55)",
          display: "flex", alignItems: "center", justifyContent: "center", zIndex: 80, padding: 16 }}>
          <div onClick={(e) => e.stopPropagation()} style={{ background: "#fff", borderRadius: 14, maxWidth: 560,
            width: "100%", maxHeight: "80vh", overflow: "auto", padding: 22 }}>
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
              <h3>Activity Log - {logs.name}</h3>
              <button className="btn btn-ghost" style={{ padding: "5px 12px" }} onClick={() => setLogs(null)}>✕</button>
            </div>
            <div style={{ marginTop: 12 }}>
              {logs.items.length ? logs.items.map((l, i) => (
                <div key={i} style={{ borderLeft: "4px solid var(--border)", padding: "10px 14px", borderRadius: 8,
                  margin: "8px 0", background: "#fafafa", fontSize: ".88rem" }}>
                  <strong>{l.activityType}</strong> · {new Date(l.timestamp).toLocaleString()}<br />{l.activityDescription}
                  <div style={{ fontSize: ".75rem", color: "var(--muted)" }}>device: {l.deviceType}</div>
                </div>
              )) : <p>No activity.</p>}
            </div>
          </div>
        </div>
      )}
    </>
  );
}

function Activity() {
  const [d, setD] = useState(null);
  useEffect(() => { adminService.activityTimeline(30).then(setD).catch(() => {}); }, []);
  if (!d) return <div className="loading">Loading...</div>;
  return (
    <>
      <h2 style={{ fontSize: "1.6rem" }}>📈 Activity Timeline</h2>
      <p style={{ color: "var(--muted)" }}>Every student action across the platform</p>
      <div style={{ margin: "12px 0" }}>
        {Object.entries(d.summary.byType).map(([k, v]) => (
          <span key={k} style={{ display: "inline-block", padding: "3px 10px", borderRadius: 999, color: "#fff",
            fontSize: ".72rem", fontWeight: 700, background: "var(--navy)", marginRight: 6, marginBottom: 6 }}>{k}: {v}</span>
        ))}
      </div>
      <table style={tableStyle}>
        <thead><tr>{["Student", "Type", "Description", "Time"].map((x) => <th key={x} style={th}>{x}</th>)}</tr></thead>
        <tbody>
          {d.timeline.map((l, i) => (
            <tr key={i}><td style={td}>{l.studentName}</td><td style={td}>{l.activityType}</td>
              <td style={td}>{l.activityDescription}</td><td style={td}>{new Date(l.timestamp).toLocaleString()}</td></tr>
          ))}
          {!d.timeline.length && <tr><td style={td} colSpan={4}>No activity</td></tr>}
        </tbody>
      </table>
    </>
  );
}

function Codes() {
  const [codes, setCodes] = useState([]);
  const [f, setF] = useState({ schoolName: "", schoolId: "", maxUses: "" });

  const load = () => adminService.dashboard().then((r) => setCodes(r.dashboard.schools.schoolCodes)).catch(() => {});
  useEffect(() => { load(); }, []);

  async function create() {
    if (!f.schoolName || !f.schoolId || !f.maxUses) return alert("Fill all fields");
    await adminService.createSchoolCode(f);
    setF({ schoolName: "", schoolId: "", maxUses: "" });
    load();
  }

  return (
    <>
      <h2 style={{ fontSize: "1.6rem" }}>🏫 School Codes</h2>
      <div style={{ display: "flex", gap: 10, flexWrap: "wrap", margin: "14px 0" }}>
        <input placeholder="School name" style={{ maxWidth: 220 }} value={f.schoolName} onChange={(e) => setF({ ...f, schoolName: e.target.value })} />
        <input placeholder="School ID" style={{ maxWidth: 160 }} value={f.schoolId} onChange={(e) => setF({ ...f, schoolId: e.target.value })} />
        <input placeholder="Max uses" type="number" style={{ maxWidth: 120 }} value={f.maxUses} onChange={(e) => setF({ ...f, maxUses: e.target.value })} />
        <button className="btn btn-primary" onClick={create}>+ Create Code</button>
      </div>
      {codes.map((c) => (
        <div key={c.code} style={{ background: "#fff", borderRadius: 14, padding: 18, boxShadow: "0 2px 10px rgba(0,0,0,.05)",
          marginBottom: 12, display: "flex", justifyContent: "space-between", alignItems: "center", flexWrap: "wrap", gap: 10 }}>
          <div><strong>{c.schoolName}</strong><br />
            <code style={{ background: "var(--navy)", color: "#fff", padding: "3px 8px", borderRadius: 6 }}>{c.code}</code></div>
          <div style={{ textAlign: "right" }}>
            <div>{c.usedCount}/{c.maxUses} used</div>
            <span style={{ padding: "3px 10px", borderRadius: 999, color: "#fff", fontSize: ".72rem", fontWeight: 700,
              background: c.isActive ? "var(--green)" : "var(--red)" }}>{c.isActive ? "Active" : "Inactive"}</span>
          </div>
        </div>
      ))}
    </>
  );
}
