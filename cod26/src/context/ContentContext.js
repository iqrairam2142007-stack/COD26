import React, { createContext, useContext, useEffect, useState, useCallback } from "react";
import contentService from "../services/contentService";
import { useAuth } from "./AuthContext";

const ContentContext = createContext({ units: [], loading: true });

/**
 * The course catalogue, loaded once and shared by the public site and the
 * dashboard. Unit rows are readable by everyone, so this works signed out.
 *
 * Reloads when the signed-in user changes: RLS decides what comes back, and
 * an admin additionally sees unpublished units.
 */
export function ContentProvider({ children }) {
  const { user, loading: authLoading } = useAuth();
  const [units, setUnits] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const load = useCallback(async () => {
    try {
      setError("");
      setUnits(await contentService.units());
    } catch (e) {
      setError(e.message || "Could not load the course.");
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    if (authLoading) return;
    load();
  }, [authLoading, user?.id, load]);

  const getUnit = useCallback(
    (id) => units.find((u) => u.id === Number(id)) || null,
    [units]
  );

  return (
    <ContentContext.Provider
      value={{ units, loading, error, getUnit, totalUnits: units.length, reload: load }}
    >
      {children}
    </ContentContext.Provider>
  );
}

export function useContent() {
  return useContext(ContentContext);
}
