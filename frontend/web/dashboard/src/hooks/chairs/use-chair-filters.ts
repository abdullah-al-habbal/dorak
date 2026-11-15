"use client";

import { useUrlFilters } from "@/hooks/core/state/use-url-filters";
import { chairFiltersFromParams, chairFiltersToParams } from "@/lib/chairs/chair-filters.util";
import type { ChairFilters } from "@/types/chairs/chair-filters.type";

/** The URL is the source of truth for chair filters. */
export function useChairFilters(): { filters: ChairFilters; update: (patch: Partial<ChairFilters>) => void } {
  return useUrlFilters(chairFiltersFromParams, chairFiltersToParams);
}
