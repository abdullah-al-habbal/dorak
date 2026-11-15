import type { AdminSubscription } from "@/types/plans/admin-subscription.type";
import type { PageInfo } from "@/types/core/page-info.type";

export interface AdminSubscriptionPage {
  items: AdminSubscription[];
  page: PageInfo;
}
