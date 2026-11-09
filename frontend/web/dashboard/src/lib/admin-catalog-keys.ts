import { createQueryKeys } from "@/lib/create-query-keys.util";
import type { AdminCatalogFilters } from "@/types/admin-catalog-filters.type";

export const adminCatalogKeys = createQueryKeys("admin-catalog", {
  list: (filters: AdminCatalogFilters) => ["list", filters] as const,
  items: (categoryId: string) => ["items", categoryId] as const,
});
