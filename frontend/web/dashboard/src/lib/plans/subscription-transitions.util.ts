import { SUBSCRIPTION_TRANSITIONS } from "@/config/platform/admin-subscription.constant";
import type { SubscriptionStatus } from "@/enums/money/subscription-status.enum";
import type { SubscriptionTarget } from "@/types/plans/subscription-target.type";

export function availableSubscriptionTargets(status: SubscriptionStatus): readonly SubscriptionTarget[] {
  return SUBSCRIPTION_TRANSITIONS[status];
}
