import profileService from "./profileService";

/**
 * The profile form is one of the paths that has never been clicked through,
 * so its validation is pinned here instead.
 */
describe("profileService.validate", () => {
  const ok = { name: "Riya Sharma", phone: "9876543210" };

  it("accepts a complete profile", () => {
    expect(profileService.validate(ok)).toBeNull();
  });

  it("accepts a blank phone - it is optional", () => {
    expect(profileService.validate({ name: "Riya", phone: "" })).toBeNull();
    expect(profileService.validate({ name: "Riya" })).toBeNull();
  });

  it("rejects a missing name", () => {
    expect(profileService.validate({ name: "", phone: "" })).toMatch(/full name/i);
  });

  it("rejects a one-character name", () => {
    expect(profileService.validate({ name: "R" })).toMatch(/full name/i);
  });

  it("rejects a name that is only whitespace", () => {
    expect(profileService.validate({ name: "   " })).toMatch(/full name/i);
  });

  it("rejects a phone that is not ten digits", () => {
    expect(profileService.validate({ ...ok, phone: "12345" })).toMatch(/10 digits/i);
    expect(profileService.validate({ ...ok, phone: "98765432101" })).toMatch(/10 digits/i);
  });

  it("rejects a phone containing letters or symbols", () => {
    expect(profileService.validate({ ...ok, phone: "98765abcde" })).toMatch(/10 digits/i);
    expect(profileService.validate({ ...ok, phone: "+919876543210" })).toMatch(/10 digits/i);
  });

  it("tolerates surrounding whitespace on the phone", () => {
    expect(profileService.validate({ ...ok, phone: " 9876543210 " })).toBeNull();
  });
});
