import type { AdminSubscription } from "@/types/admin-subscription.type";
import type { PageInfo } from "@/types/page-info.type";

export interface AdminSubscriptionPage {
  items: AdminSubscription[];
  page: PageInfo;
}
