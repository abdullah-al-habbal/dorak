import { createQueryKeys } from "@/lib/create-query-keys.util";

export const reviewKeys = createQueryKeys("reviews", {
  list: (branchId: string, page: number) => ["list", branchId, page] as const,
});
