import type { SubscriptionStatus } from "@/enums/money/subscription-status.enum";

export interface AdminSubscriptionFilters {
  status?: SubscriptionStatus;
  page: number;
}
