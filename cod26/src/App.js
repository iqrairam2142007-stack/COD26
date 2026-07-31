import React from "react";
import { AuthProvider, useAuth } from "./context/AuthContext";
import AuthPage from "./components/Auth/AuthPage";
import StudentDashboard from "./components/Dashboard/StudentDashboard";
import AdminDashboard from "./components/Admin/AdminDashboard";
import "./styles/global.css";

function Shell() {
  const { user, profile, loading, hasAccess } = useAuth();

  // Never flash the signed-out UI while the session is still rehydrating.
  if (loading) return <div className="loading">Loading...</div>;

  if (!user || !hasAccess) return <AuthPage />;
  if (profile?.role === "admin") return <AdminDashboard />;
  return <StudentDashboard />;
}

export default function App() {
  return (
    <AuthProvider>
      <Shell />
    </AuthProvider>
  );
}
