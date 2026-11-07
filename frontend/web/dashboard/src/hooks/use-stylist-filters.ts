"use client";

import { useUrlFilters } from "@/hooks/use-url-filters";
import { filtersFromParams, filtersToParams } from "@/lib/stylist-filters.util";
import type { StylistFilters } from "@/types/stylist-filters.type";

/** The URL is the source of truth for stylist filters. */
export function useStylistFilters(): { filters: StylistFilters; update: (patch: Partial<StylistFilters>) => void } {
  return useUrlFilters(filtersFromParams, filtersToParams);
}
