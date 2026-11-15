import { describe, expect, it } from "vitest";

import { emptyPlanForm, formToPlanPayload, planToForm } from "@/lib/plans/plan-form.util";
import { mapPlanSaveError } from "@/lib/plans/plan-form-error.util";
import { planSchema } from "@/schemas/plan.zod";
import { ApiClientError } from "@/services/api/core/api-client-error";

const plan = planSchema.parse({
  id: "p1",
  name: { en: "Growth", ar: "نمو" },
  description: { en: "For growing brands.", ar: null },
  price_amount_minor: 4900,
  currency: { id: "c1", code: "USD" },
  interval_unit: "month",
  interval_count: 1,
  is_active: true,
  sort_order: 3,
  feature_keys: ["multi_branch"],
  created_at: "2026-11-01T10:00:00+00:00",
});

describe("plan form mapping", () => {
  it("turns a plan into editable values, with the price in major units", () => {
    expect(planToForm(plan)).toMatchObject({ name_en: "Growth", name_ar: "نمو", description_en: "For growing brands.", description_ar: "", price: "49.00", currency_code: "USD", interval_count: "1", sort_order: "3", feature_keys: ["multi_branch"] });
  });

  it("round-trips to the backend payload with minor units and null descriptions", () => {
    expect(formToPlanPayload(planToForm(plan))).toEqual({
      name: { en: "Growth", ar: "نمو" },
      description: { en: "For growing brands.", ar: null },
      price_amount_minor: 4900,
      currency_code: "USD",
      interval_unit: "month",
      interval_count: 1,
      is_active: true,
      sort_order: 3,
      feature_keys: ["multi_branch"],
    });
  });

  it("accepts the empty array the backend sends for a missing translation", () => {
    const parsed = planSchema.parse({ ...plan, description: [] });
    expect(planToForm(parsed).description_en).toBe("");
  });

  it("starts a new plan active, monthly and without features", () => {
    expect(emptyPlanForm("USD")).toMatchObject({ currency_code: "USD", interval_unit: "month", interval_count: "1", is_active: true, feature_keys: [] });
  });

  it("defaults a blank display order to 0", () => {
    expect(formToPlanPayload({ ...planToForm(plan), sort_order: " " }).sort_order).toBe(0);
  });
});

describe("mapPlanSaveError", () => {
  it("maps API field names to form fields", () => {
    const error = new ApiClientError({ status: 422, code: "invalid_request", message: "x", fields: { price_amount_minor: ["Too low"], "name.en": ["Required"], "feature_keys.0": ["Unknown"] } });
    expect(mapPlanSaveError(error, "generic").fieldErrors).toEqual({ price: "Too low", name_en: "Required", feature_keys: "Unknown" });
  });

  it("falls back to a form-level message", () => {
    expect(mapPlanSaveError(new Error("boom"), "generic")).toEqual({ fieldErrors: {}, formError: "generic" });
  });
});
