import type { BrandStatus } from "@/enums/venue/brand-status.enum";
import { createQueryKeys } from "@/lib/core/query/create-query-keys.util";
import type { BranchFilters } from "@/types/branches/branch-filters.type";

export const branchKeys = createQueryKeys("branches", {
  list: (filters: BranchFilters) => ["list", filters] as const,
  detail: (id: string) => ["detail", id] as const,
  /** Every brand the actor can see (list labels and the brand filter). */
  brands: ["brands"] as const,
  /** One status only (the create and assign-plan pickers); under `brands`, so invalidating `brands` covers it. */
  brandsByStatus: (status: BrandStatus) => ["brands", status] as const,
});
