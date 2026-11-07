"use client";

import { usePathname, useRouter, useSearchParams } from "next/navigation";
import { useCallback, useMemo } from "react";

import { chairFiltersFromParams, chairFiltersToParams } from "@/lib/chair-filters.util";
import type { ChairFilters } from "@/types/chair-filters.type";

/** The URL is the source of truth for chair filters. */
export function useChairFilters(): { filters: ChairFilters; update: (patch: Partial<ChairFilters>) => void } {
  const router = useRouter();
  const pathname = usePathname();
  const params = useSearchParams();
  const filters = useMemo(() => chairFiltersFromParams(new URLSearchParams(params.toString())), [params]);

  const update = useCallback(
    (patch: Partial<ChairFilters>) => {
      const resetsPage = Object.keys(patch).some((key) => key !== "page");
      const query = chairFiltersToParams({ ...filters, ...(resetsPage ? { page: 1 } : {}), ...patch }).toString();
      router.replace(query ? `${pathname}?${query}` : pathname, { scroll: false });
    },
    [filters, pathname, router],
  );

  return { filters, update };
}
