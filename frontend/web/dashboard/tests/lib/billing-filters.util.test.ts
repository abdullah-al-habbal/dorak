import { describe, expect, it } from "vitest";

import { PlanState } from "@/enums/money/plan-state.enum";
import { SubscriptionStatus } from "@/enums/money/subscription-status.enum";
import { adminSubscriptionFiltersFromParams, adminSubscriptionFiltersToParams } from "@/lib/plans/admin-subscription-filters.util";
import { planFiltersFromParams, planFiltersToParams } from "@/lib/plans/plan-filters.util";

describe("plan filters", () => {
  it("reads a known state and page", () => {
    expect(planFiltersFromParams(new URLSearchParams("state=inactive&page=3"))).toEqual({ state: PlanState.Inactive, page: 3 });
  });

  it("drops unknown states and bad pages", () => {
    expect(planFiltersFromParams(new URLSearchParams("state=weird&page=-2"))).toEqual({ state: undefined, page: 1 });
    expect(planFiltersFromParams(new URLSearchParams("page=1.5")).page).toBe(1);
  });

  it("keeps the default URL clean", () => {
    expect(planFiltersToParams({ page: 1 }).toString()).toBe("");
    expect(planFiltersToParams({ state: PlanState.Active, page: 2 }).toString()).toBe("state=active&page=2");
  });
});

describe("admin subscription filters", () => {
  it("round-trips a status and page", () => {
    const params = adminSubscriptionFiltersToParams({ status: SubscriptionStatus.PastDue, page: 2 });
    expect(params.toString()).toBe("status=past_due&page=2");
    expect(adminSubscriptionFiltersFromParams(params)).toEqual({ status: SubscriptionStatus.PastDue, page: 2 });
  });

  it("ignores an unknown status", () => {
    expect(adminSubscriptionFiltersFromParams(new URLSearchParams("status=bogus")).status).toBeUndefined();
  });
});
