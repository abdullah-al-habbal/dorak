import { createQueryKeys } from "@/lib/core/create-query-keys.util";

export const adminSubscriptionKeys = createQueryKeys("admin-subscriptions", {
  list: (status: string, page: number) => ["list", status, page] as const,
});
