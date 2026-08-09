import React, { useState, useEffect, useCallback, useRef } from "react";
import { useAuth } from "../../context/AuthContext";
import notificationService from "../../services/notificationService";

const LEVEL_ICON = { info: "ℹ️", success: "✅", warning: "⚠️" };

function ago(iso) {
  const secs = Math.round((Date.now() - new Date(iso).getTime()) / 1000);
  if (secs < 60) return "just now";
  if (secs < 3600) return Math.floor(secs / 60) + "m ago";
  if (secs < 86400) return Math.floor(secs / 3600) + "h ago";
  return Math.floor(secs / 86400) + "d ago";
}

export default function NotificationBell() {
  const { profile } = useAuth();
  const [items, setItems] = useState([]);
  const [open, setOpen] = useState(false);
  const panel = useRef(null);

  const load = useCallback(async () => {
    if (!profile) return;
    try {
      setItems(await notificationService.list(profile.id));
    } catch {
      /* the bell is not worth breaking the header over */
    }
  }, [profile]);

  useEffect(() => { load(); }, [load]);

  // Close on outside click and on Escape.
  useEffect(() => {
    if (!open) return undefined;
    const onDown = (e) => {
      if (panel.current && !panel.current.contains(e.target)) setOpen(false);
    };
    const onKey = (e) => { if (e.key === "Escape") setOpen(false); };
    document.addEventListener("mousedown", onDown);
    document.addEventListener("keydown", onKey);
    return () => {
      document.removeEventListener("mousedown", onDown);
      document.removeEventListener("keydown", onKey);
    };
  }, [open]);

  const unread = items.filter((n) => !n.read).length;

  async function openPanel() {
    setOpen((o) => !o);
    if (!open) await load();
  }

  async function markAll() {
    if (!profile) return;
    try {
      await notificationService.markAllRead(profile.id, items);
      setItems((list) => list.map((n) => ({ ...n, read: true })));
    } catch {
      /* ignore - the badge will simply reappear on reload */
    }
  }

  return (
    <div className="bell-wrap" ref={panel}>
      <button className="bell" onClick={openPanel}
        aria-label={unread ? `Notifications, ${unread} unread` : "Notifications"}
        aria-expanded={open}>
        <span aria-hidden="true">🔔</span>
        {unread > 0 && <span className="bell-badge">{unread > 9 ? "9+" : unread}</span>}
      </button>

      {open && (
        <div className="bell-panel" role="dialog" aria-label="Notifications">
          <div className="bell-head">
            <strong>Notifications</strong>
            {unread > 0 && (
              <button className="linkbtn" style={{ fontSize: ".82rem" }} onClick={markAll}>
                Mark all read
              </button>
            )}
          </div>

          <div className="bell-list">
            {items.length === 0 && (
              <div className="bell-empty">Nothing yet. Announcements from your school appear here.</div>
            )}
            {items.map((n) => (
              <div key={n.id} className={"bell-item" + (n.read ? "" : " is-unread")}>
                <span className="bell-icon" aria-hidden="true">{LEVEL_ICON[n.level] || "ℹ️"}</span>
                <div style={{ minWidth: 0 }}>
                  <strong>{n.title}</strong>
                  {n.body && <div className="bell-body">{n.body}</div>}
                  <div className="bell-time">{ago(n.created_at)}</div>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
