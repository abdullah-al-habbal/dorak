"use client";

import { usePathname, useRouter, useSearchParams } from "next/navigation";
import { useCallback, useMemo } from "react";

import { filtersFromParams, filtersToParams } from "@/lib/stylist-filters.util";
import type { StylistFilters } from "@/types/stylist-filters.type";

/** The URL is the source of truth for stylist filters. */
export function useStylistFilters(): { filters: StylistFilters; update: (patch: Partial<StylistFilters>) => void } {
  const router = useRouter();
  const pathname = usePathname();
  const params = useSearchParams();
  const filters = useMemo(() => filtersFromParams(new URLSearchParams(params.toString())), [params]);

  const update = useCallback(
    (patch: Partial<StylistFilters>) => {
      const resetsPage = Object.keys(patch).some((key) => key !== "page");
      const query = filtersToParams({ ...filters, ...(resetsPage ? { page: 1 } : {}), ...patch }).toString();
      router.replace(query ? `${pathname}?${query}` : pathname, { scroll: false });
    },
    [filters, pathname, router],
  );

  return { filters, update };
}
