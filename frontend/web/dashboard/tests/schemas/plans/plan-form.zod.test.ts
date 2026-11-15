import { describe, expect, it } from "vitest";

import { enDictionary } from "@/locales/en/index.constant";
import { createPlanSchema } from "@/schemas/plans/plan-form.zod";

const schema = createPlanSchema(enDictionary.plans.form.validation);
const valid = {
  name_en: "Growth",
  name_ar: "نمو",
  description_en: "",
  description_ar: "",
  price: "49.00",
  currency_code: "USD",
  interval_unit: "month",
  interval_count: "1",
  sort_order: "0",
  is_active: true,
  feature_keys: [],
};

describe("plan form schema", () => {
  it("accepts a complete form and trims names", () => {
    expect(schema.parse({ ...valid, name_en: "  Growth " }).name_en).toBe("Growth");
  });

  it("requires both names", () => {
    expect(schema.safeParse({ ...valid, name_ar: " " }).success).toBe(false);
  });

  it("rejects negative, non-numeric and sub-cent prices", () => {
    for (const price of ["", "-1", "abc", "1.234"]) expect(schema.safeParse({ ...valid, price }).success).toBe(false);
  });

  it("accepts Arabic-Indic digits in the price", () => {
    expect(schema.safeParse({ ...valid, price: "٤٩٫٠٠" }).success).toBe(true);
  });

  it("bounds the interval count to 1-120 and the display order to 0-100000", () => {
    expect(schema.safeParse({ ...valid, interval_count: "0" }).success).toBe(false);
    expect(schema.safeParse({ ...valid, interval_count: "121" }).success).toBe(false);
    expect(schema.safeParse({ ...valid, interval_count: "1.5" }).success).toBe(false);
    expect(schema.safeParse({ ...valid, sort_order: "100001" }).success).toBe(false);
    expect(schema.safeParse({ ...valid, sort_order: "" }).success).toBe(true);
  });

  it("rejects an unknown interval unit", () => {
    expect(schema.safeParse({ ...valid, interval_unit: "decade" }).success).toBe(false);
  });
});
