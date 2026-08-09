import { validateFile, formatBytes, iconFor, MAX_BYTES } from "./resourceService";

const file = (name, size, type = "") => ({ name, size, type });

describe("resourceService.validateFile", () => {
  it("accepts a normal file", () => {
    expect(validateFile(file("notes.pdf", 2 * 1024 * 1024, "application/pdf"))).toBeNull();
  });

  it("rejects nothing being chosen", () => {
    expect(validateFile(null)).toMatch(/choose a file/i);
  });

  it("rejects a file over the 25 MB limit", () => {
    const msg = validateFile(file("big.pdf", MAX_BYTES + 1));
    expect(msg).toMatch(/limit is 25 MB/i);
  });

  it("accepts a file exactly on the limit", () => {
    expect(validateFile(file("edge.pdf", MAX_BYTES))).toBeNull();
  });

  it("names the actual size in the error, so the message is actionable", () => {
    expect(validateFile(file("big.pdf", 30 * 1024 * 1024))).toMatch(/30\.0 MB/);
  });
});

describe("formatBytes", () => {
  it("uses MB at or above one megabyte", () => {
    expect(formatBytes(1024 * 1024)).toBe("1.0 MB");
    expect(formatBytes(2.5 * 1024 * 1024)).toBe("2.5 MB");
  });

  it("uses KB below one megabyte", () => {
    expect(formatBytes(2048)).toBe("2 KB");
  });

  it("returns empty for missing or zero size rather than 'NaN'", () => {
    expect(formatBytes(0)).toBe("");
    expect(formatBytes(undefined)).toBe("");
    expect(formatBytes(null)).toBe("");
  });
});

describe("iconFor", () => {
  it("marks links regardless of their extension", () => {
    expect(iconFor({ kind: "link", url: "https://docs.python.org/x.pdf" })).toBe("🔗");
  });

  it("picks an icon from the stored key", () => {
    expect(iconFor({ kind: "file", storage_key: "unit-1/notes.pdf" })).toBe("📕");
    expect(iconFor({ kind: "file", storage_key: "unit-1/diagram.PNG" })).toBe("🖼️");
    expect(iconFor({ kind: "file", storage_key: "unit-1/code.py" })).toBe("📄");
    expect(iconFor({ kind: "file", storage_key: "unit-1/pack.zip" })).toBe("🗜️");
  });

  it("falls back to a generic icon for an unknown type", () => {
    expect(iconFor({ kind: "file", storage_key: "unit-1/thing.xyz" })).toBe("📎");
  });

  it("does not throw when the key is missing", () => {
    expect(() => iconFor({ kind: "file" })).not.toThrow();
  });
});
