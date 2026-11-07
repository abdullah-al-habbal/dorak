"use client";

import { usePathname, useRouter, useSearchParams } from "next/navigation";
import { useCallback, useMemo } from "react";

import { planFiltersFromParams, planFiltersToParams } from "@/lib/plan-filters.util";
import type { PlanFilters } from "@/types/plan-filters.type";

/** The URL is the source of truth for the state filter and page. */
export function usePlanFilters(): { filters: PlanFilters; update: (patch: Partial<PlanFilters>) => void } {
  const router = useRouter();
  const pathname = usePathname();
  const params = useSearchParams();
  const filters = useMemo(() => planFiltersFromParams(new URLSearchParams(params.toString())), [params]);

  const update = useCallback(
    (patch: Partial<PlanFilters>) => {
      const resetsPage = Object.keys(patch).some((key) => key !== "page");
      const query = planFiltersToParams({ ...filters, ...(resetsPage ? { page: 1 } : {}), ...patch }).toString();
      router.replace(query ? `${pathname}?${query}` : pathname, { scroll: false });
    },
    [filters, pathname, router],
  );

  return { filters, update };
}
