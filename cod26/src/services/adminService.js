import insforge, { unwrap } from "../lib/insforge";

/**
 * Admin reads go through the `admin` edge function, which checks the caller's
 * role server-side. Nothing here is trusted from the browser.
 */
async function call(action, payload = {}) {
  return unwrap(await insforge.functions.invoke("admin", { body: { action, ...payload } }));
}

const adminService = {
  dashboard: () => call("dashboard"),
  students: (filters) => call("students", { filters }),
  studentLogs: (userId) => call("studentLogs", { userId }),
  activityTimeline: (days) => call("activity", { days }),
  createSchoolCode: (body) => call("createSchoolCode", body),
};

export default adminService;
