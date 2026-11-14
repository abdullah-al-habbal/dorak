import { describe, expect, it } from "vitest";

import { draftFromTerms, draftToPayload } from "@/lib/service-override.util";
import type { ServiceTerms } from "@/types/service-terms.type";

const terms: ServiceTerms = {
  id: "s1",
  serviceable_id: "barber-1",
  serviceable_type: "barber",
  price_amount_minor: 2500,
  currency_code: "USD",
  duration_minutes: 45,
  is_at_home: false,
  is_active: true,
  is_overridden: false,
  default_price_amount_minor: 2000,
  default_duration_minutes: 30,
};

describe("service override drafts", () => {
  it("starts from the terms the brand applies", () => {
    expect(draftFromTerms(terms)).toEqual({ price: "25.00", duration: "45" });
    expect(draftFromTerms({ ...terms, duration_minutes: null }).duration).toBe("");
  });

  it("sends a real difference as an override", () => {
    expect(draftToPayload({ price: "25", duration: "45" }, terms)).toEqual({ payload: { price_amount_minor: 2500, duration_minutes: 45 } });
  });

  it("sends a value equal to the barber's default as null", () => {
    expect(draftToPayload({ price: "20", duration: "45" }, terms)).toEqual({ payload: { price_amount_minor: null, duration_minutes: 45 } });
    expect(draftToPayload({ price: "25", duration: "30" }, terms)).toEqual({ payload: { price_amount_minor: 2500, duration_minutes: null } });
  });

  it("treats blank fields as no override", () => {
    expect(draftToPayload({ price: "", duration: "50" }, terms)).toEqual({ payload: { price_amount_minor: null, duration_minutes: 50 } });
  });

  it("reports nothing to save when every value is default or blank", () => {
    expect(draftToPayload({ price: "20", duration: "30" }, terms)).toEqual({ error: "nothing" });
    expect(draftToPayload({ price: "", duration: "" }, terms)).toEqual({ error: "nothing" });
  });

  it("rejects an unreadable price or a non-whole duration", () => {
    expect(draftToPayload({ price: "abc", duration: "" }, terms)).toEqual({ error: "invalid" });
    expect(draftToPayload({ price: "-1", duration: "" }, terms)).toEqual({ error: "invalid" });
    expect(draftToPayload({ price: "", duration: "1.5" }, terms)).toEqual({ error: "invalid" });
    expect(draftToPayload({ price: "", duration: "0" }, terms)).toEqual({ error: "invalid" });
  });
});
