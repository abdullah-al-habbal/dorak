import { createQueryKeys } from "@/lib/core/create-query-keys.util";

export const reviewKeys = createQueryKeys("reviews", {
  list: (branchId: string, page: number) => ["list", branchId, page] as const,
});
