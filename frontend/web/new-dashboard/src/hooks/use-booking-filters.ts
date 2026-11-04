"use client";

import { usePathname, useRouter, useSearchParams } from "next/navigation";
import { useCallback, useMemo } from "react";

import { filtersFromParams, filtersToParams } from "@/lib/booking-filters.util";
import type { BookingFilters } from "@/types/booking-filters.type";

/** The URL is the source of truth for view, date and filters, so a link reproduces the screen. */
export function useBookingFilters() {
  const router = useRouter();
  const pathname = usePathname();
  const params = useSearchParams();
  const today = useMemo(() => new Date(), []);
  const filters = useMemo(() => filtersFromParams(new URLSearchParams(params.toString()), today), [params, today]);

  const update = useCallback(
    (patch: Partial<BookingFilters>) => {
      const resetsPage = Object.keys(patch).some((key) => key !== "page");
      const next = { ...filters, ...(resetsPage ? { page: 1 } : {}), ...patch };
      const query = filtersToParams(next, today).toString();
      router.replace(query ? `${pathname}?${query}` : pathname, { scroll: false });
    },
    [filters, pathname, router, today],
  );

  return { filters, update, today };
}
