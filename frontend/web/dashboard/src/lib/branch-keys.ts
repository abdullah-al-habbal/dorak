import type { BranchFilters } from "@/types/branch-filters.type";

export const branchKeys = {
  all: ["branches"] as const,
  list: (filters: BranchFilters) => ["branches", "list", filters] as const,
  detail: (id: string) => ["branches", "detail", id] as const,
  brands: ["branches", "brands"] as const,
};
