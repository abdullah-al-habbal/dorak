import { SUBSCRIPTION_TRANSITIONS } from "@/config/admin-subscription.constant";
import type { SubscriptionStatus } from "@/enums/subscription-status.enum";
import type { SubscriptionTarget } from "@/types/subscription-target.type";

export function availableSubscriptionTargets(status: SubscriptionStatus): readonly SubscriptionTarget[] {
  return SUBSCRIPTION_TRANSITIONS[status];
}
