import { createQueryKeys } from "@/lib/core/query/create-query-keys.util";

export const subscriptionKeys = createQueryKeys("subscription", {
  current: () => ["current"] as const,
});
