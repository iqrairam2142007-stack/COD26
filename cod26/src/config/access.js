/**
 * What a student can reach without paying.
 *
 * Which units are free is admin-editable data (`units.is_free`), not a
 * constant. These helpers take a unit row so there is one source of truth:
 * the database. The server enforces the same rule via public.is_free_unit()
 * in RLS and in the quiz edge function - this copy only decides what the UI
 * offers.
 */

export function isUnitFree(unit) {
  return unit?.is_free === true;
}

/**
 * Access tiers, widest first:
 *   "full"  - paid or school-code student
 *   "free"  - signed in, not paid: free units + leaderboard
 *   "guest" - signed out: free units only
 */
export function canOpenUnit(tier, unit) {
  return tier === "full" || isUnitFree(unit);
}

/** The quiz writes progress, so it needs a real account even on a free unit. */
export function canTakeQuiz(tier, unit) {
  return tier === "full" || (tier === "free" && isUnitFree(unit));
}
