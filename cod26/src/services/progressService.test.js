import progressService from "./progressService";
import insforge from "../lib/insforge";

jest.mock("../lib/insforge", () => {
  const api = { database: { from: jest.fn() } };
  return { __esModule: true, default: api, unwrap: ({ data, error }) => {
    if (error) throw new Error(error.message);
    return data;
  } };
});

function mockRows(rows) {
  insforge.database.from.mockImplementation(() => {
    const chain = {
      select: () => chain,
      eq: () => Promise.resolve({ data: rows, error: null }),
    };
    return chain;
  });
}

/**
 * Chapter completion drives the per-unit progress bar and the green ticks on
 * the chapter rail. This is the shape the reader depends on.
 */
describe("progressService.chapters", () => {
  it("returns a Set for fast lookup by chapter id", async () => {
    mockRows([
      { chapter_id: "c1", unit_id: 1 },
      { chapter_id: "c2", unit_id: 1 },
    ]);
    const p = await progressService.chapters("user-1");
    expect(p.done).toBeInstanceOf(Set);
    expect(p.done.has("c1")).toBe(true);
    expect(p.done.has("nope")).toBe(false);
  });

  it("groups completed chapters by unit", async () => {
    mockRows([
      { chapter_id: "c1", unit_id: 1 },
      { chapter_id: "c2", unit_id: 1 },
      { chapter_id: "c9", unit_id: 3 },
    ]);
    const p = await progressService.chapters("user-1");
    expect(p.byUnit[1]).toEqual(["c1", "c2"]);
    expect(p.byUnit[3]).toEqual(["c9"]);
    expect(p.byUnit[2]).toBeUndefined();
  });

  it("counts the total across every unit", async () => {
    mockRows([
      { chapter_id: "c1", unit_id: 1 },
      { chapter_id: "c2", unit_id: 2 },
      { chapter_id: "c3", unit_id: 26 },
    ]);
    const p = await progressService.chapters("user-1");
    expect(p.total).toBe(3);
  });

  it("handles a brand new student with no progress", async () => {
    mockRows([]);
    const p = await progressService.chapters("user-1");
    expect(p.total).toBe(0);
    expect(p.done.size).toBe(0);
    expect(p.byUnit).toEqual({});
  });

  it("does not throw when the query returns null", async () => {
    mockRows(null);
    const p = await progressService.chapters("user-1");
    expect(p.total).toBe(0);
    expect(p.done.size).toBe(0);
  });
});
