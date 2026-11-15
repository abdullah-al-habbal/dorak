import { describe, expect, it } from "vitest";

import { payoutListSchema } from "@/schemas/earnings/payout.zod";
import { subscriptionListSchema } from "@/schemas/plans/subscription.zod";

const payout = { id: "p1", status: "paid", direction_type: "platform_to_brand", total_amount_minor: 1000, currency_code: "USD", brand: { id: "b1", name: { en: "Brand", ar: "علامة" } }, paid_at: null, created_at: "2026-11-01T10:00:00+00:00", extra: 1 };

describe("payout schema", () => {
  it("accepts a backend row with an unknown extra field", () => {
    expect(payoutListSchema.parse([payout])[0]?.status).toBe("paid");
  });

  it("rejects an unknown status or direction", () => {
    expect(payoutListSchema.safeParse([{ ...payout, status: "weird" }]).success).toBe(false);
    expect(payoutListSchema.safeParse([{ ...payout, direction_type: "sideways" }]).success).toBe(false);
  });
});

describe("subscription schema", () => {
  const subscription = {
    id: "s1",
    status: "past_due",
    brand: { id: "b1", name: { en: "Brand" } },
    plan: { id: "pl", name: { en: "Growth" }, description: null, price_amount_minor: 4900, currency_code: "USD", interval_unit: "month", interval_count: 1, feature_keys: ["multi_branch"] },
    features: { multi_branch: true, job_board: false },
    starts_at: null,
    grace_ends_at: "2026-11-20T00:00:00+00:00",
  };

  it("accepts a past-due subscription with feature flags", () => {
    expect(subscriptionListSchema.parse([subscription])[0]?.features.job_board).toBe(false);
  });

  it("rejects an unknown interval unit", () => {
    expect(subscriptionListSchema.safeParse([{ ...subscription, plan: { ...subscription.plan, interval_unit: "decade" } }]).success).toBe(false);
  });
});
