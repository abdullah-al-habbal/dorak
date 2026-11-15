import { describe, expect, it } from "vitest";

import { SubscriptionStatus } from "@/enums/money/subscription-status.enum";
import { availableSubscriptionTargets } from "@/lib/plans/subscription-transitions.util";

describe("availableSubscriptionTargets", () => {
  it("mirrors the backend state machine", () => {
    expect(availableSubscriptionTargets(SubscriptionStatus.Pending)).toEqual([SubscriptionStatus.Active, SubscriptionStatus.Cancelled]);
    expect(availableSubscriptionTargets(SubscriptionStatus.Active)).toEqual([SubscriptionStatus.PastDue, SubscriptionStatus.Cancelled]);
    expect(availableSubscriptionTargets(SubscriptionStatus.PastDue)).toEqual([SubscriptionStatus.Active, SubscriptionStatus.Cancelled]);
  });

  it("offers nothing for a cancelled subscription and never targets pending", () => {
    expect(availableSubscriptionTargets(SubscriptionStatus.Cancelled)).toEqual([]);
    for (const status of Object.values(SubscriptionStatus)) {
      expect(availableSubscriptionTargets(status)).not.toContain(SubscriptionStatus.Pending);
    }
  });
});
