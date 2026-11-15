import type { SubscriptionStatus } from "@/enums/subscription-status.enum";

export interface AdminSubscriptionFilters {
  status?: SubscriptionStatus;
  page: number;
}
