import { useState, useEffect } from "react";

/**
 * Minimal pushState router.
 *
 * The app has six routes and no nested layouts, so a router dependency would
 * cost more than it returns. This gives real URLs, working back/forward, and
 * shareable links in about thirty lines.
 */

const EVENT = "cod26:navigate";

export function currentPath() {
  return window.location.pathname.replace(/\/+$/, "") || "/";
}

export function navigate(to, { replace = false } = {}) {
  if (to === currentPath()) return;
  window.history[replace ? "replaceState" : "pushState"]({}, "", to);
  window.dispatchEvent(new Event(EVENT));
  window.scrollTo(0, 0);
}

export function useRoute() {
  const [path, setPath] = useState(currentPath);

  useEffect(() => {
    const sync = () => setPath(currentPath());
    // popstate covers back/forward; the custom event covers navigate().
    window.addEventListener("popstate", sync);
    window.addEventListener(EVENT, sync);
    return () => {
      window.removeEventListener("popstate", sync);
      window.removeEventListener(EVENT, sync);
    };
  }, []);

  return path;
}

/**
 * An <a> that navigates client-side but stays a real link, so middle-click,
 * ctrl-click and "copy link address" all behave normally.
 */
export function Link({ to, children, className, onClick, ...rest }) {
  return (
    <a
      href={to}
      className={className}
      onClick={(e) => {
        if (e.metaKey || e.ctrlKey || e.shiftKey || e.button !== 0) return;
        e.preventDefault();
        onClick?.(e);
        navigate(to);
      }}
      {...rest}
    >
      {children}
    </a>
  );
}
