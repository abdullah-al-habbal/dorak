"use client";

import { useCallback, useMemo } from "react";

import { useUrlFilters } from "@/hooks/use-url-filters";
import { filtersFromParams, filtersToParams } from "@/lib/booking-filters.util";
import type { BookingFilters } from "@/types/booking-filters.type";

/** The URL is the source of truth for view, date and filters, so a link reproduces the screen. */
export function useBookingFilters(): { filters: BookingFilters; update: (patch: Partial<BookingFilters>) => void; today: Date } {
  const today = useMemo(() => new Date(), []);
  const fromParams = useCallback((params: URLSearchParams) => filtersFromParams(params, today), [today]);
  const toParams = useCallback((filters: BookingFilters) => filtersToParams(filters, today), [today]);
  const { filters, update } = useUrlFilters(fromParams, toParams);
  return { filters, update, today };
}
