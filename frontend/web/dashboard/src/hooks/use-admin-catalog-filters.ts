"use client";

import { useCallback } from "react";

import { useUrlState } from "@/hooks/use-url-state";
import { adminCatalogFiltersFromParams, adminCatalogFiltersToParams } from "@/lib/admin-catalog-filters.util";
import type { AdminCatalogFilters } from "@/types/admin-catalog-filters.type";

/** The URL holds the status filter and the search. The list is not paginated, so this is `useUrlState`, not `useUrlFilters`. */
export function useAdminCatalogFilters(): { filters: AdminCatalogFilters; update: (patch: Partial<AdminCatalogFilters>) => void } {
  const { value: filters, setValue } = useUrlState(adminCatalogFiltersFromParams, adminCatalogFiltersToParams);
  const update = useCallback((patch: Partial<AdminCatalogFilters>) => setValue({ ...filters, ...patch }), [filters, setValue]);
  return { filters, update };
}
