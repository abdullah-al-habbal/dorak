"use client";

import { usePathname, useRouter, useSearchParams } from "next/navigation";
import { useCallback, useMemo } from "react";

import { scheduleFiltersFromParams, scheduleFiltersToParams } from "@/lib/schedule-filters.util";
import type { ScheduleFilters } from "@/types/schedule-filters.type";

/** The URL is the source of truth for the range, status and page. */
export function useScheduleFilters(): { filters: ScheduleFilters; update: (patch: Partial<ScheduleFilters>) => void } {
  const router = useRouter();
  const pathname = usePathname();
  const params = useSearchParams();
  const filters = useMemo(() => scheduleFiltersFromParams(new URLSearchParams(params.toString())), [params]);

  const update = useCallback(
    (patch: Partial<ScheduleFilters>) => {
      const resetsPage = Object.keys(patch).some((key) => key !== "page");
      const query = scheduleFiltersToParams({ ...filters, ...(resetsPage ? { page: 1 } : {}), ...patch }).toString();
      router.replace(query ? `${pathname}?${query}` : pathname, { scroll: false });
    },
    [filters, pathname, router],
  );

  return { filters, update };
}
