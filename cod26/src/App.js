import React, { useEffect } from "react";
import { AuthProvider, useAuth } from "./context/AuthContext";
import { ContentProvider } from "./context/ContentContext";
import { useRoute, navigate } from "./lib/router";
import SiteNav from "./components/Public/SiteNav";
import SiteFooter from "./components/Public/SiteFooter";
import HomePage from "./components/Public/HomePage";
import CoursesPage from "./components/Public/CoursesPage";
import PublicUnit from "./components/Public/PublicUnit";
import NotFound from "./components/Public/NotFound";
import AuthPage from "./components/Auth/AuthPage";
import AdminLogin from "./components/Auth/AdminLogin";
import StudentDashboard from "./components/Dashboard/StudentDashboard";
import AdminDashboard from "./components/Admin/AdminDashboard";
import "./styles/global.css";

/** Routes that render the app shell instead of the public site chrome. */
const APP_ROUTES = ["/dashboard", "/admin"];

function Shell() {
  const path = useRoute();
  const { user, profile, loading, hasAccess } = useAuth();

  const isAdmin = profile?.role === "admin";
  // /unit/3 opens chapter 1; /unit/3/4 deep-links chapter 4.
  const unitMatch = path.match(/^\/unit\/(\d+)(?:\/(\d+))?$/);

  // Send people somewhere sensible instead of rendering a screen they cannot
  // use. Runs as an effect so navigation happens after render, not during it.
  useEffect(() => {
    if (loading) return;
    if (!user && APP_ROUTES.includes(path)) {
      navigate("/login", { replace: true });
    } else if (user && path === "/login") {
      navigate(isAdmin ? "/admin" : "/dashboard", { replace: true });
    } else if (user && isAdmin && path === "/admin/login") {
      // The staff door only holds a signed-out visitor; an admin passes through.
      navigate("/admin", { replace: true });
    } else if (user && !isAdmin && path === "/admin") {
      navigate("/dashboard", { replace: true });
    } else if (user && isAdmin && path === "/dashboard") {
      navigate("/admin", { replace: true });
    }
  }, [loading, user, isAdmin, path]);

  if (loading) return <div className="loading">Loading…</div>;

  // ------------------------------------------------------------- app shell
  if (path === "/admin") {
    return isAdmin ? <AdminDashboard /> : <div className="loading">Redirecting…</div>;
  }
  if (path === "/dashboard") {
    if (!user) return <div className="loading">Redirecting…</div>;
    return <StudentDashboard tier={hasAccess ? "full" : "free"} />;
  }

  // ----------------------------------------------------------- public site
  let page;
  if (path === "/") page = <HomePage />;
  else if (path === "/courses") page = <CoursesPage />;
  else if (unitMatch) {
    page = <PublicUnit unitId={Number(unitMatch[1])}
      chapterIndex={unitMatch[2] ? Number(unitMatch[2]) - 1 : 0} />;
  }
  else if (path === "/login") page = <AuthPage />;
  else if (path === "/admin/login") page = <AdminLogin />;
  else page = <NotFound />;

  return (
    <div className="site">
      <SiteNav path={path} />
      <main className="site-main">{page}</main>
      <SiteFooter />
    </div>
  );
}

export default function App() {
  return (
    <AuthProvider>
      <ContentProvider>
        <Shell />
      </ContentProvider>
    </AuthProvider>
  );
}
