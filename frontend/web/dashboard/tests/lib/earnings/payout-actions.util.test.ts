import { describe, expect, it } from "vitest";

import { PayoutAction } from "@/enums/money/payout-action.enum";
import { PayoutStatus } from "@/enums/money/payout-status.enum";
import { availablePayoutActions } from "@/lib/earnings/payout-actions.util";

describe("availablePayoutActions", () => {
  it("offers approve and cancel on a draft", () => {
    expect(availablePayoutActions(PayoutStatus.Draft)).toEqual([PayoutAction.Approve, PayoutAction.Cancel]);
  });

  it("offers mark paid and cancel on an approved payout, never approve again", () => {
    expect(availablePayoutActions(PayoutStatus.Approved)).toEqual([PayoutAction.MarkPaid, PayoutAction.Cancel]);
  });

  it("offers nothing once a payout is paid or cancelled", () => {
    expect(availablePayoutActions(PayoutStatus.Paid)).toEqual([]);
    expect(availablePayoutActions(PayoutStatus.Cancelled)).toEqual([]);
  });

  it("uses the backend path segments as action values", () => {
    expect(Object.values(PayoutAction)).toEqual(["approve", "mark-paid", "cancel"]);
  });
});
