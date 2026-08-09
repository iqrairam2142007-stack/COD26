import insforge, { unwrap } from "../lib/insforge";

const profileService = {
  /** Mirrors what the signup form asks for, so the rules cannot drift. */
  validate({ name, phone }) {
    if (!name || name.trim().length < 2) return "Please enter your full name.";
    if (phone && !/^\d{10}$/.test(phone.trim())) {
      return "Phone should be exactly 10 digits, or left blank.";
    }
    return null;
  },

  /**
   * Only contact fields. role, access_status and access_expires_at are
   * reverted by the profiles_protect_columns trigger for non-admins, so
   * sending them would be silently ignored anyway.
   */
  async update(userId, { name, phone, class_level, school, student_id }) {
    return unwrap(
      await insforge.database
        .from("profiles")
        .update({
          name: name.trim(),
          phone: phone?.trim() || null,
          class_level: class_level || null,
          school: school?.trim() || null,
          student_id: student_id?.trim() || null,
        })
        .eq("id", userId)
    );
  },
};

export default profileService;
