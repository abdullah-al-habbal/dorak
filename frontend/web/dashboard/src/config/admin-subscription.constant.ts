import { SubscriptionStatus } from "@/enums/subscription-status.enum";
import type { SubscriptionTarget } from "@/types/subscription-target.type";

export const ADMIN_SUBSCRIPTION_PER_PAGE = 10;

/** Mirrors `SubscriptionStatus::canTransitionTo`; the backend stays the authority and answers 409 otherwise. */
export const SUBSCRIPTION_TRANSITIONS: Record<SubscriptionStatus, readonly SubscriptionTarget[]> = {
  [SubscriptionStatus.Pending]: [SubscriptionStatus.Active, SubscriptionStatus.Cancelled],
  [SubscriptionStatus.Active]: [SubscriptionStatus.PastDue, SubscriptionStatus.Cancelled],
  [SubscriptionStatus.PastDue]: [SubscriptionStatus.Active, SubscriptionStatus.Cancelled],
  [SubscriptionStatus.Cancelled]: [],
};
