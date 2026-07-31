import React, { createContext, useContext, useEffect, useState, useCallback } from "react";
import authService from "../services/authService";

const AuthContext = createContext({ user: null, profile: null, loading: true });

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null);
  const [profile, setProfile] = useState(null);
  const [loading, setLoading] = useState(true);

  const hydrate = useCallback(async () => {
    const u = await authService.currentUser();
    if (!u) {
      setUser(null);
      setProfile(null);
      setLoading(false);
      return;
    }
    setUser(u);
    try {
      setProfile(await authService.profile(u.id));
    } catch {
      setProfile(null);
    }
    setLoading(false);
  }, []);

  useEffect(() => {
    let cancelled = false;
    (async () => {
      await hydrate();
      if (cancelled) return;
    })();
    return () => {
      cancelled = true;
    };
  }, [hydrate]);

  async function logout() {
    await authService.logout();
    setUser(null);
    setProfile(null);
  }

  const hasAccess =
    profile?.access_status === "active" &&
    (!profile.access_expires_at || new Date(profile.access_expires_at) > new Date());

  return (
    <AuthContext.Provider
      value={{ user, profile, loading, hasAccess, refresh: hydrate, logout }}
    >
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  return useContext(AuthContext);
}
