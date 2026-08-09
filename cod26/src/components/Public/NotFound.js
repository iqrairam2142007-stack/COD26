import React from "react";
import { navigate } from "../../lib/router";

export default function NotFound() {
  return (
    <div className="section">
      <div className="section-inner narrow center">
        <div style={{ fontSize: "3rem" }} aria-hidden="true">🧭</div>
        <h1 className="section-title">Page not found</h1>
        <p className="lede">
          That link does not point anywhere on COD26. It may have moved, or the
          address may have a typo.
        </p>
        <div className="hero-cta center">
          <button className="btn btn-primary" onClick={() => navigate("/")}>Go home</button>
          <button className="btn btn-ghost" onClick={() => navigate("/courses")}>Browse units</button>
        </div>
      </div>
    </div>
  );
}
