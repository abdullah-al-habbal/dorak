import { createQueryKeys } from "@/lib/create-query-keys.util";
import type { BranchFilters } from "@/types/branch-filters.type";

export const branchKeys = createQueryKeys("branches", {
  list: (filters: BranchFilters) => ["list", filters] as const,
  detail: (id: string) => ["detail", id] as const,
  brands: ["brands"] as const,
});
