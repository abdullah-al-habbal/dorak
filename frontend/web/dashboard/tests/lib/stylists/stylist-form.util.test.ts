import { describe, expect, it } from "vitest";

import { BarberStatus } from "@/enums/people/barber-status.enum";
import { enDictionary } from "@/locales/en/index.constant";
import { emptyStylistForm, formToStylistPayload, stylistToForm } from "@/lib/stylists/stylist-form.util";
import { createStylistSchema } from "@/schemas/stylists/stylist-form.zod";

const messages = enDictionary.stylists.form.validation;
const VALID = { ...emptyStylistForm(), name_en: "Ali", name_ar: "علي", email: "ali@example.com", password: "a-long-enough-password" };

describe("stylist form", () => {
  it("requires a 12+ character password only when creating", () => {
    expect(createStylistSchema(messages, true).safeParse({ ...VALID, password: "short" }).success).toBe(false);
    expect(createStylistSchema(messages, true).safeParse(VALID).success).toBe(true);
    expect(createStylistSchema(messages, false).safeParse({ ...VALID, password: "" }).success).toBe(true);
    expect(createStylistSchema(messages, false).safeParse({ ...VALID, password: "short" }).success).toBe(false);
  });

  it("requires both names and a valid email", () => {
    const result = createStylistSchema(messages, true).safeParse({ ...VALID, name_ar: " ", email: "nope" });
    const issues = result.success ? [] : result.error.issues.map((issue) => issue.message);
    expect(issues).toContain(messages.name);
    expect(issues).toContain(messages.email);
  });

  it("turns empty optional fields into absent values in the payload", () => {
    expect(formToStylistPayload({ ...VALID, password: "", phone: " " })).toEqual({
      name: { en: "Ali", ar: "علي" },
      email: "ali@example.com",
      phone: undefined,
      password: undefined,
      chair_id: null,
    });
  });

  it("prefills both languages from the translations map", () => {
    const form = stylistToForm({
      id: "1", name: "Ali", name_translations: { en: "Ali", ar: "علي" }, email: "a@b.co", status: BarberStatus.Enabled, rating_count: 0, chair: { id: "c1" },
    });
    expect(form).toMatchObject({ name_en: "Ali", name_ar: "علي", chair_id: "c1", password: "" });
  });
});
