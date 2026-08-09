import { streakFrom } from "./attendanceService";

const DAY = 86400000;
const iso = (offsetDays) =>
  new Date(Date.now() - offsetDays * DAY).toISOString().slice(0, 10);

describe("streakFrom", () => {
  it("is zero with no attendance", () => {
    expect(streakFrom([])).toBe(0);
  });

  it("counts today alone as one", () => {
    expect(streakFrom([iso(0)])).toBe(1);
  });

  it("counts consecutive days ending today", () => {
    expect(streakFrom([iso(0), iso(1), iso(2)])).toBe(3);
  });

  it("still counts a run that ended yesterday - today may not be logged yet", () => {
    expect(streakFrom([iso(1), iso(2)])).toBe(2);
  });

  it("breaks the streak on a missed day", () => {
    // studied today and yesterday, then a gap, then more
    expect(streakFrom([iso(0), iso(1), iso(4), iso(5)])).toBe(2);
  });

  it("is zero when the most recent day is older than yesterday", () => {
    expect(streakFrom([iso(3), iso(4)])).toBe(0);
  });

  it("does not double-count duplicate dates", () => {
    expect(streakFrom([iso(0), iso(0), iso(1)])).toBe(2);
  });

  it("is order independent", () => {
    expect(streakFrom([iso(2), iso(0), iso(1)])).toBe(3);
  });
});
