import { createQueryKeys } from "@/lib/create-query-keys.util";

export const subscriptionKeys = createQueryKeys("subscription", {
  current: () => ["current"] as const,
});
