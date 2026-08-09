import { currentPath, navigate } from "./router";

/**
 * Routing decides whether a visitor sees the home page or the login form, so
 * the path handling is pinned here rather than trusted to manual clicking.
 */
function at(path) {
  window.history.replaceState({}, "", path);
}

describe("currentPath", () => {
  it("reports the current path", () => {
    at("/courses");
    expect(currentPath()).toBe("/courses");
  });

  it("normalises the root", () => {
    at("/");
    expect(currentPath()).toBe("/");
  });

  it("strips a trailing slash so /courses/ and /courses are the same route", () => {
    at("/courses/");
    expect(currentPath()).toBe("/courses");
  });

  it("ignores the query string, which carries ?tab= not the route", () => {
    at("/login?tab=register");
    expect(currentPath()).toBe("/login");
  });

  it("ignores the hash used by the home-page anchors", () => {
    at("/#pricing");
    expect(currentPath()).toBe("/");
  });

  it("keeps a nested chapter path intact", () => {
    at("/unit/12/4");
    expect(currentPath()).toBe("/unit/12/4");
  });
});

describe("navigate", () => {
  it("changes the path and notifies listeners", () => {
    at("/");
    const seen = [];
    const listener = () => seen.push(currentPath());
    window.addEventListener("cod26:navigate", listener);

    navigate("/courses");
    expect(currentPath()).toBe("/courses");
    expect(seen).toEqual(["/courses"]);

    window.removeEventListener("cod26:navigate", listener);
  });

  it("does nothing when already on the target path", () => {
    at("/courses");
    const seen = [];
    const listener = () => seen.push("fired");
    window.addEventListener("cod26:navigate", listener);

    navigate("/courses");
    expect(seen).toEqual([]);

    window.removeEventListener("cod26:navigate", listener);
  });

  it("replace: true does not add a history entry", () => {
    at("/");
    const before = window.history.length;
    navigate("/login", { replace: true });
    expect(currentPath()).toBe("/login");
    expect(window.history.length).toBe(before);
  });
});
