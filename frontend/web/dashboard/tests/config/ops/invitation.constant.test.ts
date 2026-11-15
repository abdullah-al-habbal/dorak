import { describe, expect, it } from "vitest";

import { BARBER_CONTACT_PATTERN } from "@/config/ops/invitation.constant";

describe("BARBER_CONTACT_PATTERN", () => {
  it.each(["lina@example.com", "+963 111 222 333", "00963111222333"])("treats %s as an exact contact", (value) => {
    expect(BARBER_CONTACT_PATTERN.test(value)).toBe(true);
  });

  it.each(["Lina Saad", "lina", "12345", "a@", "two words@x"])("treats %s as a name search", (value) => {
    expect(BARBER_CONTACT_PATTERN.test(value)).toBe(false);
  });
});
