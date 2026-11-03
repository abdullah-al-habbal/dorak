import { describe, expect, it } from "vitest";
import { barberServiceOverrideBody } from "@/services/api/dashboard/barber-service-override/barber-service-override.util";

describe("barberServiceOverrideBody", () => {
  it("converts the price to minor units and names the brand", () => {
    expect(
      barberServiceOverrideBody("brand-1", {
        price: 35.5,
        durationMinutes: 45,
      }),
    ).toEqual({
      brand_id: "brand-1",
      price_amount_minor: 3550,
      duration_minutes: 45,
    });
  });

  it("sends null for a field left at the barber default", () => {
    expect(
      barberServiceOverrideBody("brand-1", {
        price: null,
        durationMinutes: 20,
      }),
    ).toEqual({
      brand_id: "brand-1",
      price_amount_minor: null,
      duration_minutes: 20,
    });
  });
});
