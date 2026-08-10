import React from "react";
import { Link } from "../../lib/router";
import { useContent } from "../../context/ContentContext";

export default function SiteFooter() {
  const { totalUnits } = useContent();
  return (
    <footer className="sitefooter">
      <div className="sitefooter-inner">
        <div className="sitefooter-brand">
          <div className="brand" style={{ color: "#fff" }}>
            <span className="brand-mark">C26</span>
            <span>COD26</span>
          </div>
          <p>Create. Optimize. Develop.</p>
          <p className="sitefooter-fine">
            A {totalUnits}-unit Python course for school and first-year
            engineering students.
          </p>
        </div>

        <div className="sitefooter-col">
          <h4>Learn</h4>
          <Link to="/courses">All units</Link>
          <Link to="/unit/1">Free first chapter</Link>
          <Link to="/#pricing">Pricing</Link>
        </div>

        <div className="sitefooter-col">
          <h4>Account</h4>
          <Link to="/login">Log in</Link>
          <Link to="/login?tab=register">Register</Link>
          <Link to="/login?tab=school">School code</Link>
        </div>

        <div className="sitefooter-col">
          <h4>Support</h4>
          <a href="mailto:officialcod70@gmail.com">officialcod70@gmail.com</a>
          <span className="sitefooter-fine">
            Enrolled students can ask the in-app assistant any course question.
          </span>
        </div>
      </div>

      <div className="sitefooter-bar">
        © {new Date().getFullYear()} COD26. All rights reserved.
      </div>
    </footer>
  );
}
