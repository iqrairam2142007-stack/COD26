import notificationService from "./notificationService";
import insforge from "../lib/insforge";

jest.mock("../lib/insforge", () => {
  const api = { database: { from: jest.fn() } };
  return { __esModule: true, default: api, unwrap: ({ data, error }) => {
    if (error) throw new Error(error.message);
    return data;
  } };
});

/**
 * A broadcast is one row shared by every student, with read state held
 * separately. Merging those two queries is the part worth pinning: get it
 * wrong and either everyone sees an unread badge forever, or nobody does.
 */
function mockTables({ notifications, reads }) {
  insforge.database.from.mockImplementation((table) => {
    if (table === "notifications") {
      const chain = {
        select: () => chain,
        order: () => chain,
        limit: () => Promise.resolve({ data: notifications, error: null }),
      };
      return chain;
    }
    if (table === "notification_reads") {
      const chain = {
        select: () => chain,
        eq: () => Promise.resolve({ data: reads, error: null }),
      };
      return chain;
    }
    throw new Error("unexpected table " + table);
  });
}

const USER = "user-1";

describe("notificationService.list", () => {
  it("marks a notification read when the user has a read row", async () => {
    mockTables({
      notifications: [{ id: "n1", title: "Welcome", user_id: null }],
      reads: [{ notification_id: "n1" }],
    });
    const items = await notificationService.list(USER);
    expect(items[0].read).toBe(true);
  });

  it("marks a notification unread when there is no read row", async () => {
    mockTables({
      notifications: [{ id: "n1", title: "Welcome", user_id: null }],
      reads: [],
    });
    const items = await notificationService.list(USER);
    expect(items[0].read).toBe(false);
  });

  it("resolves read state per notification, not all-or-nothing", async () => {
    mockTables({
      notifications: [
        { id: "n1", title: "Old" },
        { id: "n2", title: "New" },
        { id: "n3", title: "Newer" },
      ],
      reads: [{ notification_id: "n1" }, { notification_id: "n3" }],
    });
    const items = await notificationService.list(USER);
    expect(items.map((n) => [n.id, n.read])).toEqual([
      ["n1", true], ["n2", false], ["n3", true],
    ]);
  });

  it("keeps the original fields on each notification", async () => {
    mockTables({
      notifications: [{ id: "n1", title: "Unit 6 videos are up", body: "Go watch", level: "success" }],
      reads: [],
    });
    const [item] = await notificationService.list(USER);
    expect(item.title).toBe("Unit 6 videos are up");
    expect(item.body).toBe("Go watch");
    expect(item.level).toBe("success");
  });

  it("survives the read query returning nothing at all", async () => {
    mockTables({ notifications: [{ id: "n1", title: "x" }], reads: null });
    const items = await notificationService.list(USER);
    expect(items[0].read).toBe(false);
  });

  it("returns an empty list when there are no notifications", async () => {
    mockTables({ notifications: [], reads: [] });
    expect(await notificationService.list(USER)).toEqual([]);
  });
});
