import { isUnitFree, canOpenUnit, canTakeQuiz } from "./access";

/**
 * These rules decide what a non-paying visitor can reach. The server enforces
 * the same thing (public.is_free_unit in RLS, and the quiz edge function), but
 * a regression here would quietly give paid units away in the UI.
 */
const free = { id: 1, title: "Introduction to Python", is_free: true };
const paid = { id: 9, title: "File I/O", is_free: false };

describe("isUnitFree", () => {
  it("reads the unit's own flag rather than a hardcoded id", () => {
    expect(isUnitFree(free)).toBe(true);
    expect(isUnitFree(paid)).toBe(false);
  });

  it("does not treat a missing unit as free", () => {
    expect(isUnitFree(null)).toBe(false);
    expect(isUnitFree(undefined)).toBe(false);
    expect(isUnitFree({})).toBe(false);
  });

  it("requires a real boolean, not a truthy value", () => {
    expect(isUnitFree({ is_free: "no" })).toBe(false);
    expect(isUnitFree({ is_free: 1 })).toBe(false);
  });
});

describe("canOpenUnit", () => {
  it("lets a paid student open anything", () => {
    expect(canOpenUnit("full", free)).toBe(true);
    expect(canOpenUnit("full", paid)).toBe(true);
  });

  it("limits signed-in free users to free units", () => {
    expect(canOpenUnit("free", free)).toBe(true);
    expect(canOpenUnit("free", paid)).toBe(false);
  });

  it("limits signed-out guests to free units", () => {
    expect(canOpenUnit("guest", free)).toBe(true);
    expect(canOpenUnit("guest", paid)).toBe(false);
  });

  it("denies paid units for an unknown tier rather than defaulting open", () => {
    expect(canOpenUnit(undefined, paid)).toBe(false);
    expect(canOpenUnit("nonsense", paid)).toBe(false);
  });

  it("denies a unit that failed to load", () => {
    expect(canOpenUnit("free", null)).toBe(false);
    expect(canOpenUnit("guest", undefined)).toBe(false);
  });
});

describe("canTakeQuiz", () => {
  it("allows a paid student on any unit", () => {
    expect(canTakeQuiz("full", paid)).toBe(true);
  });

  it("allows a signed-in free user on a free unit only", () => {
    expect(canTakeQuiz("free", free)).toBe(true);
    expect(canTakeQuiz("free", paid)).toBe(false);
  });

  it("never allows a guest - the quiz writes progress, so it needs an account", () => {
    expect(canTakeQuiz("guest", free)).toBe(false);
    expect(canTakeQuiz("guest", paid)).toBe(false);
  });
});
