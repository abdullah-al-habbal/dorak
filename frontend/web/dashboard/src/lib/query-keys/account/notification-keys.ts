import { createQueryKeys } from "@/lib/core/query/create-query-keys.util";

export const notificationKeys = createQueryKeys("dashboard-notifications", {
  feed: ["feed"] as const,
});
