import React, { useState, useEffect } from "react";
import videoService from "../../services/videoService";

/**
 * Videos attached to a unit. RLS decides what comes back, so a student
 * without access simply gets an empty list rather than a hidden URL.
 */
export default function UnitVideos({ unitId }) {
  const [videos, setVideos] = useState(null);

  useEffect(() => {
    let cancelled = false;
    setVideos(null);
    videoService
      .forUnit(unitId)
      .then((rows) => { if (!cancelled) setVideos(rows); })
      .catch(() => { if (!cancelled) setVideos([]); });
    return () => { cancelled = true; };
  }, [unitId]);

  // Nothing to show while loading, and nothing to show for a unit with no
  // videos - an empty heading would just be noise.
  if (!videos || !videos.length) return null;

  return (
    <section className="videos">
      <h3 className="videos-title">🎬 Lesson videos</h3>
      {videos.map((v) => (
        <figure key={v.id} className="video-item">
          <video
            controls
            preload="metadata"
            playsInline
            className="video-el"
            src={v.url}
          >
            Your browser cannot play this video.{" "}
            <a href={v.url} target="_blank" rel="noreferrer">Download it instead.</a>
          </video>
          <figcaption className="video-cap">{v.title}</figcaption>
        </figure>
      ))}
    </section>
  );
}
