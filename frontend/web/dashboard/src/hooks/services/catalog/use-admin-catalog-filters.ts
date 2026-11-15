"use client";

import { useUrlState } from "@/hooks/core/state/use-url-state";
import { adminCatalogFiltersFromParams, adminCatalogFiltersToParams } from "@/lib/services/admin-catalog-filters.util";
import type { AdminCatalogFilters } from "@/types/services/admin-catalog-filters.type";

/** The URL holds the status filter and the search. The list is not paginated, so this is `useUrlState`, not `useUrlFilters`. */
export function useAdminCatalogFilters(): { filters: AdminCatalogFilters; update: (patch: Partial<AdminCatalogFilters>) => void } {
  const { value: filters, setValue } = useUrlState(adminCatalogFiltersFromParams, adminCatalogFiltersToParams);
  const update = (patch: Partial<AdminCatalogFilters>): void => setValue({ ...filters, ...patch });
  return { filters, update };
}
