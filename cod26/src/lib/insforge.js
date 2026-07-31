import { createClient } from "@insforge/sdk";

const baseUrl = process.env.REACT_APP_INSFORGE_URL;
const anonKey = process.env.REACT_APP_INSFORGE_ANON_KEY;

if (!baseUrl || !anonKey) {
  // Fail loudly in dev instead of silently sending requests to undefined.
  console.error(
    "Missing REACT_APP_INSFORGE_URL / REACT_APP_INSFORGE_ANON_KEY. " +
      "Copy .env.example to .env and fill in the values."
  );
}

/**
 * The SDK derives the edge-function host from baseUrl as
 * `<appkey>.function.insforge.app`, but this backend serves them from
 * `<appkey>.function2.insforge.app`. The wrong host fails DNS, and the SDK
 * only falls back to the `/functions/<slug>` proxy path on an HTTP 404 - a
 * network error is returned as-is. So pass the host explicitly.
 *
 * Override with REACT_APP_INSFORGE_FUNCTIONS_URL if the backend moves again.
 */
function functionsUrlFor(url) {
  if (process.env.REACT_APP_INSFORGE_FUNCTIONS_URL) {
    return process.env.REACT_APP_INSFORGE_FUNCTIONS_URL;
  }
  if (!url) return undefined;
  try {
    const { protocol, hostname } = new URL(url);
    const appkey = hostname.split(".")[0];
    return `${protocol}//${appkey}.function2.insforge.app`;
  } catch {
    return undefined;
  }
}

export const insforge = createClient({
  baseUrl,
  anonKey,
  functionsUrl: functionsUrlFor(baseUrl),
});

/** Unwrap the SDK's { data, error } shape into a value-or-throw. */
export function unwrap({ data, error }) {
  if (error) throw new Error(error.message || "Request failed");
  return data;
}

export default insforge;
