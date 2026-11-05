import { describe, expect, it } from "vitest";
import {
  mapBarberServiceTerms,
  mapBarberServiceTermsList,
} from "@/services/api/dashboard/barber-service-override/barber-service-override.mapper.util";

const wire = {
  id: "service-1",
  name: { en: "Haircut", ar: "قص شعر" },
  currency_code: "USD",
  price_amount_minor: 3500,
  duration_minutes: 45,
  default_price_amount_minor: 2000,
  default_duration_minutes: 30,
  is_overridden: true,
};

describe("mapBarberServiceTerms", () => {
  it("maps an overridden service next to the barber default", () => {
    expect(mapBarberServiceTerms(wire)).toEqual({
      id: "service-1",
      name: { en: "Haircut", ar: "قص شعر" },
      currencyCode: "USD",
      priceAmountMinor: 3500,
      durationMinutes: 45,
      defaultPriceAmountMinor: 2000,
      defaultDurationMinutes: 30,
      isOverridden: true,
    });
  });

  it("treats the effective values as the default when the backend sends no default fields", () => {
    const { default_price_amount_minor, default_duration_minutes, ...plain } =
      wire;
    expect(default_price_amount_minor).toBe(2000);
    expect(default_duration_minutes).toBe(30);

    const terms = mapBarberServiceTerms({ ...plain, is_overridden: undefined });

    expect(terms.defaultPriceAmountMinor).toBe(3500);
    expect(terms.defaultDurationMinutes).toBeNull();
    expect(terms.isOverridden).toBe(false);
  });

  it("keeps a missing duration null", () => {
    expect(
      mapBarberServiceTerms({ ...wire, duration_minutes: null })
        .durationMinutes,
    ).toBeNull();
  });
});

describe("mapBarberServiceTermsList", () => {
  it("maps every row and tolerates a non-array payload", () => {
    expect(mapBarberServiceTermsList([wire, wire])).toHaveLength(2);
    expect(mapBarberServiceTermsList(null)).toEqual([]);
  });
});
