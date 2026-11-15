import { createQueryKeys } from "@/lib/core/create-query-keys.util";

export const notificationKeys = createQueryKeys("dashboard-notifications", {
  feed: ["feed"] as const,
});
