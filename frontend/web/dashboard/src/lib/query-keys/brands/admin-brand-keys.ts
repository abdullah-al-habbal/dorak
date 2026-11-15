import { createQueryKeys } from "@/lib/create-query-keys.util";
import type { AdminBrandFilters } from "@/types/brands/admin-brand-filters.type";

export const adminBrandKeys = createQueryKeys("admin-brands", {
  list: (filters: AdminBrandFilters) => ["list", filters] as const,
  detail: (id: string) => ["detail", id] as const,
});
