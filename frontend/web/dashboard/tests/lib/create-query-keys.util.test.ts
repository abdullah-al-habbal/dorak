import { describe, expect, it } from "vitest";

import { adminPayoutKeys } from "@/lib/admin-payout-keys";
import { adminSubscriptionKeys } from "@/lib/admin-subscription-keys";
import { analyticsKeys } from "@/lib/analytics-keys";
import { bookingKeys } from "@/lib/booking-keys";
import { branchKeys } from "@/lib/branch-keys";
import { chairKeys } from "@/lib/chair-keys";
import { createQueryKeys, queryKey } from "@/lib/create-query-keys.util";
import { earningsKeys } from "@/lib/earnings-keys";
import { openingHoursKeys } from "@/lib/opening-hours-keys";
import { payoutKeys } from "@/lib/payout-keys";
import { planKeys } from "@/lib/plan-keys";
import { platformSettingsKeys } from "@/lib/platform-settings-keys";
import { reviewKeys } from "@/lib/review-keys";
import { scheduleKeys } from "@/lib/schedule-keys";
import { serviceKeys } from "@/lib/service-keys";
import { stylistKeys } from "@/lib/stylist-keys";
import { subscriptionKeys } from "@/lib/subscription-keys";

const RANGE = { from: "2026-01-01", to: "2026-01-31" } as never;
const FILTERS = { search: "a" } as never;

describe("createQueryKeys", () => {
  it("prefixes fixed and built keys with the root and exposes the root as all", () => {
    const keys = createQueryKeys("things", {
      fixed: ["fixed"] as const,
      one: (id: string) => ["one", id] as const,
    });

    expect(keys.all).toEqual(["things"]);
    expect(keys.fixed).toEqual(["things", "fixed"]);
    expect(keys.one("7")).toEqual(["things", "one", "7"]);
  });

  it("builds a single key with queryKey", () => {
    expect(queryKey("a", "b", 2)).toEqual(["a", "b", 2]);
  });
});

describe("migrated key modules keep their original key structures", () => {
  it("matches the pre-factory keys", () => {
    expect(adminPayoutKeys.all).toEqual(["admin-payouts"]);
    expect(adminPayoutKeys.list("paid", 2)).toEqual([
      "admin-payouts",
      "list",
      "paid",
      2,
    ]);
    expect(adminSubscriptionKeys.all).toEqual(["admin-subscriptions"]);
    expect(adminSubscriptionKeys.list("active", 1)).toEqual([
      "admin-subscriptions",
      "list",
      "active",
      1,
    ]);
    expect(analyticsKeys.all).toEqual(["platform-analytics"]);
    expect(analyticsKeys.range(RANGE)).toEqual([
      "platform-analytics",
      "2026-01-01",
      "2026-01-31",
    ]);
    expect(bookingKeys.all).toEqual(["bookings"]);
    expect(bookingKeys.list(FILTERS)).toEqual(["bookings", "list", FILTERS]);
    expect(bookingKeys.history("9")).toEqual(["bookings", "history", "9"]);
    expect(bookingKeys.chairs).toEqual(["bookings", "chairs"]);
    expect(bookingKeys.services).toEqual(["bookings", "services"]);
    expect(branchKeys.all).toEqual(["branches"]);
    expect(branchKeys.list(FILTERS)).toEqual(["branches", "list", FILTERS]);
    expect(branchKeys.detail("3")).toEqual(["branches", "detail", "3"]);
    expect(branchKeys.brands).toEqual(["branches", "brands"]);
    expect(chairKeys.all).toEqual(["chairs"]);
    expect(chairKeys.list(FILTERS)).toEqual(["chairs", "list", FILTERS]);
    expect(earningsKeys.all).toEqual(["earnings"]);
    expect(earningsKeys.range(RANGE)).toEqual([
      "earnings",
      "2026-01-01",
      "2026-01-31",
    ]);
    expect(openingHoursKeys.branch("5")).toEqual(["opening-hours", "5"]);
    expect(openingHoursKeys.branches).toEqual(["branch-options"]);
    expect(payoutKeys.all).toEqual(["payouts"]);
    expect(payoutKeys.list("pending", 3)).toEqual([
      "payouts",
      "list",
      "pending",
      3,
    ]);
    expect(planKeys.all).toEqual(["admin-plans"]);
    expect(planKeys.list("active", 1)).toEqual([
      "admin-plans",
      "list",
      "active",
      1,
    ]);
    expect(planKeys.options).toEqual(["admin-plans", "options"]);
    expect(planKeys.featureKeys).toEqual(["admin-plans", "feature-keys"]);
    expect(platformSettingsKeys.all).toEqual(["platform-settings"]);
    expect(reviewKeys.all).toEqual(["reviews"]);
    expect(reviewKeys.list("b1", 2)).toEqual(["reviews", "list", "b1", 2]);
    expect(scheduleKeys.all).toEqual(["schedule"]);
    expect(scheduleKeys.appointments("today", "open", 1)).toEqual([
      "schedule",
      "appointments",
      "today",
      "open",
      1,
    ]);
    expect(scheduleKeys.hours).toEqual(["schedule", "hours"]);
    expect(serviceKeys.all).toEqual(["services"]);
    expect(serviceKeys.list(undefined)).toEqual(["services", "list", ""]);
    expect(serviceKeys.list("cut")).toEqual(["services", "list", "cut"]);
    expect(serviceKeys.currencies).toEqual(["currencies"]);
    expect(serviceKeys.categories).toEqual(["service-categories"]);
    expect(stylistKeys.all).toEqual(["stylists"]);
    expect(stylistKeys.list(FILTERS)).toEqual(["stylists", "list", FILTERS]);
    expect(subscriptionKeys.all).toEqual(["subscription"]);
    expect(subscriptionKeys.current()).toEqual(["subscription", "current"]);
  });
});
