"use client";

import { useUrlFilters } from "@/hooks/use-url-filters";
import { serviceFiltersFromParams, serviceFiltersToParams } from "@/lib/service-filters.util";
import type { ServiceFilters } from "@/types/services/service-filters.type";

/** The URL holds the search text and the brand, so a link reproduces the list. */
export function useServiceFilters(): { filters: ServiceFilters; update: (patch: Partial<ServiceFilters>) => void } {
  return useUrlFilters(serviceFiltersFromParams, serviceFiltersToParams);
}
