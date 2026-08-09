import { validateFile, formatBytes, MAX_BYTES, ACCEPTED_TYPES } from "./videoService";

const file = (name, size, type = "") => ({ name, size, type });

describe("videoService.validateFile", () => {
  it("accepts an MP4 by mime type", () => {
    expect(validateFile(file("lesson.mp4", 5_000_000, "video/mp4"))).toBeNull();
  });

  it("accepts a WebM by mime type", () => {
    expect(validateFile(file("lesson.webm", 5_000_000, "video/webm"))).toBeNull();
  });

  it("falls back to the extension when the browser sends no mime type", () => {
    // Some browsers report an empty type for files dragged from certain apps.
    expect(validateFile(file("lesson.mp4", 5_000_000, ""))).toBeNull();
    expect(validateFile(file("LESSON.MP4", 5_000_000, ""))).toBeNull();
  });

  it("rejects a format the browser cannot play", () => {
    expect(validateFile(file("lesson.avi", 5_000_000, "video/x-msvideo")))
      .toMatch(/MP4 and WebM/i);
  });

  it("rejects a non-video pretending to be an upload", () => {
    expect(validateFile(file("notes.pdf", 1000, "application/pdf")))
      .toMatch(/MP4 and WebM/i);
  });

  it("rejects nothing being chosen", () => {
    expect(validateFile(null)).toMatch(/choose a video/i);
  });

  it("rejects a file over the 100 MB limit", () => {
    expect(validateFile(file("big.mp4", MAX_BYTES + 1, "video/mp4")))
      .toMatch(/limit is 100 MB/i);
  });

  it("accepts a file exactly on the limit", () => {
    expect(validateFile(file("edge.mp4", MAX_BYTES, "video/mp4"))).toBeNull();
  });

  it("only advertises formats browsers can actually play", () => {
    expect(ACCEPTED_TYPES).toEqual(["video/mp4", "video/webm"]);
  });
});

describe("videoService.formatBytes", () => {
  it("reports large videos in MB", () => {
    expect(formatBytes(52_428_800)).toBe("50.0 MB");
  });

  it("returns empty rather than NaN for a missing size", () => {
    expect(formatBytes(undefined)).toBe("");
  });
});
