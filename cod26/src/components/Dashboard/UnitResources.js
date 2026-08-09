import React, { useState, useEffect } from "react";
import resourceService, { formatBytes, iconFor } from "../../services/resourceService";

/**
 * Notes, PDFs and links attached to a unit. RLS decides what comes back, so
 * a student without access gets an empty list rather than a hidden URL.
 */
export default function UnitResources({ unitId }) {
  const [items, setItems] = useState(null);

  useEffect(() => {
    let cancelled = false;
    setItems(null);
    resourceService
      .forUnit(unitId)
      .then((rows) => { if (!cancelled) setItems(rows); })
      .catch(() => { if (!cancelled) setItems([]); });
    return () => { cancelled = true; };
  }, [unitId]);

  // A heading over nothing is just noise.
  if (!items || !items.length) return null;

  return (
    <section className="resources">
      <h3 className="videos-title">📎 Notes &amp; resources</h3>
      <ul className="resource-list">
        {items.map((r) => (
          <li key={r.id}>
            <a className="resource-item" href={r.url}
              target="_blank" rel="noreferrer"
              download={r.kind === "file" ? "" : undefined}>
              <span className="resource-icon" aria-hidden="true">{iconFor(r)}</span>
              <span className="resource-text">
                <strong>{r.title}</strong>
                {r.description && <span className="resource-desc">{r.description}</span>}
              </span>
              <span className="resource-meta">
                {r.kind === "link" ? "Open ↗" : formatBytes(r.size_bytes) || "Download"}
              </span>
            </a>
          </li>
        ))}
      </ul>
    </section>
  );
}
