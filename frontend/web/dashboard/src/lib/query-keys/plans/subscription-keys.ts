import { createQueryKeys } from "@/lib/core/create-query-keys.util";

export const subscriptionKeys = createQueryKeys("subscription", {
  current: () => ["current"] as const,
});
