"use client";

import { useUrlFilters } from "@/hooks/use-url-filters";
import { scheduleFiltersFromParams, scheduleFiltersToParams } from "@/lib/schedule-filters.util";
import type { ScheduleFilters } from "@/types/schedule-filters.type";

/** The URL is the source of truth for the range, status and page. */
export function useScheduleFilters(): { filters: ScheduleFilters; update: (patch: Partial<ScheduleFilters>) => void } {
  return useUrlFilters(scheduleFiltersFromParams, scheduleFiltersToParams);
}
