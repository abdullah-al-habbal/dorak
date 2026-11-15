"use client";

import { useUrlFilters } from "@/hooks/core/state/use-url-filters";
import { adminBrandFiltersFromParams, adminBrandFiltersToParams } from "@/lib/brands/admin-brand-filters.util";
import type { AdminBrandFilters } from "@/types/brands/admin-brand-filters.type";

/** The URL is the source of truth for the status filter, the search and the page. */
export function useAdminBrandFilters(): { filters: AdminBrandFilters; update: (patch: Partial<AdminBrandFilters>) => void } {
  return useUrlFilters(adminBrandFiltersFromParams, adminBrandFiltersToParams);
}
