import { describe, expect, it } from "vitest";

import { adminPayoutListSchema } from "@/schemas/earnings/admin-payout.zod";
import { adminSubscriptionListSchema } from "@/schemas/plans/admin-subscription.zod";
import { planFeatureKeysSchema, planListSchema } from "@/schemas/plans/plan.zod";

const payout = { id: "p1", status: "draft", direction_type: "platform_to_brand", total_amount_minor: 1000, currency: { id: "c", code: "USD" }, brand: { id: "b1", name: { en: "Brand", ar: "علامة" } }, notes: null, created_at: "2026-11-01T10:00:00+00:00" };

describe("admin payout schema", () => {
  it("accepts a draft with the nested currency and notes", () => {
    const [row] = adminPayoutListSchema.parse([{ ...payout, notes: "check" }]);
    expect(row?.currency?.code).toBe("USD");
    expect(row?.notes).toBe("check");
  });

  it("rejects an unknown status", () => {
    expect(adminPayoutListSchema.safeParse([{ ...payout, status: "weird" }]).success).toBe(false);
  });
});

describe("plan schema", () => {
  const plan = { id: "pl", name: { en: "Growth", ar: "نمو" }, description: [], price_amount_minor: 4900, currency: { code: "USD" }, interval_unit: "month", interval_count: 1, is_active: false, sort_order: 0 };

  it("defaults missing feature keys and tolerates an empty-array description", () => {
    expect(planListSchema.parse([plan])[0]?.feature_keys).toEqual([]);
  });

  it("rejects an unknown interval unit", () => {
    expect(planListSchema.safeParse([{ ...plan, interval_unit: "decade" }]).success).toBe(false);
  });

  it("parses the feature key list", () => {
    expect(planFeatureKeysSchema.parse(["multi_branch", "job_board"])).toHaveLength(2);
  });
});

describe("admin subscription schema", () => {
  it("accepts a past-due subscription with its grace end", () => {
    const [row] = adminSubscriptionListSchema.parse([{ id: "s1", status: "past_due", brand: { id: "b", name: { en: "B" } }, plan: { id: "p", name: { en: "P" } }, grace_ends_at: "2026-11-20T00:00:00+00:00" }]);
    expect(row?.grace_ends_at).toBe("2026-11-20T00:00:00+00:00");
  });

  it("rejects an unknown status", () => {
    expect(adminSubscriptionListSchema.safeParse([{ id: "s1", status: "paused" }]).success).toBe(false);
  });
});
