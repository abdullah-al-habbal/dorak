import { describe, expect, it } from "vitest";

import { enDictionary } from "@/locales/en/index.constant";
import { createStylistSchema } from "@/schemas/stylist-form.zod";

const messages = enDictionary.stylists.form.validation;
const VALID = { name_en: "Sara", name_ar: "سارة", email: "sara@example.test", phone: "", password: "a-secure-password", chair_id: "" };

function messagesFor(result: ReturnType<ReturnType<typeof createStylistSchema>["safeParse"]>): string[] {
  return result.success ? [] : result.error.issues.map((issue) => issue.message);
}

describe("stylist form schema", () => {
  const create = createStylistSchema(messages, true);
  const edit = createStylistSchema(messages, false);

  it("accepts a complete form and trims names, email and phone", () => {
    const parsed = create.parse({ ...VALID, name_en: " Sara ", email: " sara@example.test ", phone: " +966 " });
    expect([parsed.name_en, parsed.email, parsed.phone]).toEqual(["Sara", "sara@example.test", "+966"]);
  });

  it("reports localised name and email messages", () => {
    expect(messagesFor(create.safeParse({ ...VALID, name_ar: " " }))).toEqual([messages.name]);
    expect(messagesFor(create.safeParse({ ...VALID, email: "nope" }))).toEqual([messages.email]);
    expect(create.safeParse({ ...VALID, phone: "1".repeat(31) }).success).toBe(false);
  });

  it("requires a 12 character password only when creating", () => {
    expect(messagesFor(create.safeParse({ ...VALID, password: "" }))).toEqual([messages.password]);
    expect(messagesFor(create.safeParse({ ...VALID, password: "short" }))).toEqual([messages.password]);
    expect(edit.safeParse({ ...VALID, password: "" }).success).toBe(true);
    expect(messagesFor(edit.safeParse({ ...VALID, password: "short" }))).toEqual([messages.password]);
  });
});
