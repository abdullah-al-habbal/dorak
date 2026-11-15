import { createQueryKeys } from "@/lib/core/query/create-query-keys.util";
import type { NotificationFilters } from "@/types/account/profile/notification-filters.type";

export const notificationKeys = createQueryKeys("dashboard-notifications", {
  feed: ["feed"] as const,
  list: (filters: NotificationFilters) => ["list", filters] as const,
});
