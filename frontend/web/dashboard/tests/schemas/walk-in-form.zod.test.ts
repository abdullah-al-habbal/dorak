import { describe, expect, it } from "vitest";

import { enDictionary } from "@/locales/en/index.constant";
import { createWalkInSchema } from "@/schemas/walk-in-form.zod";

const NOW = new Date(2026, 10, 4, 10, 0).getTime();
const schema = createWalkInSchema(enDictionary.bookings.walkIn.validation, () => NOW);
const VALID = { customer_name: "Ali", customer_email: "ali@example.com", customer_phone: "", chair_id: "c1", service_ids: ["s1"], starts_at: "2026-11-04T10:30" };

describe("walk-in form schema", () => {
  it("accepts a complete future booking", () => {
    expect(schema.safeParse(VALID).success).toBe(true);
  });

  it("rejects past starts, missing services and bad email with localised messages", () => {
    const result = schema.safeParse({ ...VALID, starts_at: "2026-11-04T09:00", service_ids: [], customer_email: "nope" });
    expect(result.success).toBe(false);
    const messages = result.success ? [] : result.error.issues.map((issue) => issue.message);
    expect(messages).toContain(enDictionary.bookings.walkIn.validation.start);
    expect(messages).toContain(enDictionary.bookings.walkIn.validation.services);
    expect(messages).toContain(enDictionary.bookings.walkIn.validation.email);
  });
});
