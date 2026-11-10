import { createQueryKeys } from "@/lib/create-query-keys.util";

export const notificationKeys = createQueryKeys("dashboard-notifications", {
  feed: ["feed"] as const,
});
