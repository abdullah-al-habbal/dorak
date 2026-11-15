import { createQueryKeys } from "@/lib/core/query/create-query-keys.util";

export const commissionKeys = createQueryKeys("commissions", {
  rules: (page: number) => ["rules", page] as const,
  entries: (brandId: string, settled: string, page: number) => ["entries", brandId, settled, page] as const,
});
