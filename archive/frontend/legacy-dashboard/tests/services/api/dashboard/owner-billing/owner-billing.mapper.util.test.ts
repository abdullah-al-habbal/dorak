import { describe, expect, it } from "vitest";
import {
  mapOwnerPayout,
  mapOwnerSubscription,
} from "@/services/api/dashboard/owner-billing/owner-billing.mapper.util";

describe("owner billing mappers", () => {
  it("maps a brand subscription with its plan price and features", () => {
    expect(
      mapOwnerSubscription({
        id: "s1",
        status: "active",
        brand: { id: "b1", name: { en: "Fade", ar: "فيد" } },
        plan: {
          name: { en: "Pro", ar: "محترف" },
          price_amount_minor: 4900,
          currency_code: "JOD",
          interval_unit: "month",
          interval_count: 1,
          feature_keys: ["multi_branch"],
        },
        ends_at: "2026-12-01T00:00:00+00:00",
        grace_ends_at: null,
      }),
    ).toMatchObject({
      brandName: "Fade",
      planName: "Pro",
      priceMinor: 4900,
      featureKeys: ["multi_branch"],
      graceEndsAt: null,
    });
  });

  it("maps a payout without admin-only fields", () => {
    expect(
      mapOwnerPayout({
        id: "p1",
        status: "paid",
        direction_type: "brand_to_platform",
        total_amount_minor: 1000,
        currency_code: "JOD",
        brand: { name: { en: "Fade", ar: "" } },
        paid_at: "2026-11-01T00:00:00+00:00",
      }),
    ).toMatchObject({
      totalMinor: 1000,
      status: "paid",
      externalReference: null,
    });
  });
});
