import type { SubscriptionStatus } from "@/enums/subscription-status.enum";

/** A status an admin can move a subscription to; `pending` is only ever the starting point. */
export type SubscriptionTarget = Exclude<SubscriptionStatus, SubscriptionStatus.Pending>;
