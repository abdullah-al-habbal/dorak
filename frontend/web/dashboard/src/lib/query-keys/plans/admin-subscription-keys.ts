import { createQueryKeys } from "@/lib/core/query/create-query-keys.util";

export const adminSubscriptionKeys = createQueryKeys("admin-subscriptions", {
  list: (status: string, page: number) => ["list", status, page] as const,
});
