import React, { useState } from "react";
import { useAuth } from "../../context/AuthContext";
import { Link, navigate } from "../../lib/router";

const LINKS = [
  ["/", "Home"],
  ["/courses", "Courses"],
  ["/#features", "Features"],
  ["/#pricing", "Pricing"],
];

export default function SiteNav({ path }) {
  const { user, profile, loading } = useAuth();
  const [open, setOpen] = useState(false);

  const dashHref = profile?.role === "admin" ? "/admin" : "/dashboard";
  const close = () => setOpen(false);

  return (
    <header className="sitenav">
      <div className="sitenav-inner">
        <Link to="/" className="brand" onClick={close}>
          <span className="brand-mark">C26</span>
          <span>COD26</span>
        </Link>

        <button
          className="nav-toggle"
          aria-expanded={open}
          aria-label={open ? "Close menu" : "Open menu"}
          onClick={() => setOpen((o) => !o)}
        >
          {open ? "✕" : "☰"}
        </button>

        <nav className={"sitenav-links" + (open ? " is-open" : "")}>
          {LINKS.map(([href, label]) => (
            <Link key={href} to={href} onClick={close}
              className={"sitenav-link" + (path === href ? " is-active" : "")}>
              {label}
            </Link>
          ))}

          <div className="sitenav-actions">
            {loading ? null : user ? (
              <button className="btn btn-primary btn-sm"
                onClick={() => { close(); navigate(dashHref); }}>
                {profile?.role === "admin" ? "Admin" : "My dashboard"}
              </button>
            ) : (
              <>
                <button className="btn btn-ghost btn-sm"
                  onClick={() => { close(); navigate("/login"); }}>Log in</button>
                <button className="btn btn-primary btn-sm"
                  onClick={() => { close(); navigate("/login?tab=register"); }}>Get started</button>
              </>
            )}
          </div>
        </nav>
      </div>
    </header>
  );
}
