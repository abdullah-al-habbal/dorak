"use client";

import { usePathname, useRouter, useSearchParams } from "next/navigation";
import { useCallback, useMemo } from "react";

import { branchFiltersFromParams, branchFiltersToParams } from "@/lib/branch-filters.util";
import type { BranchFilters } from "@/types/branch-filters.type";

/** The URL is the source of truth for branch filters. */
export function useBranchFilters(): { filters: BranchFilters; update: (patch: Partial<BranchFilters>) => void } {
  const router = useRouter();
  const pathname = usePathname();
  const params = useSearchParams();
  const filters = useMemo(() => branchFiltersFromParams(new URLSearchParams(params.toString())), [params]);

  const update = useCallback(
    (patch: Partial<BranchFilters>) => {
      const resetsPage = Object.keys(patch).some((key) => key !== "page");
      const query = branchFiltersToParams({ ...filters, ...(resetsPage ? { page: 1 } : {}), ...patch }).toString();
      router.replace(query ? `${pathname}?${query}` : pathname, { scroll: false });
    },
    [filters, pathname, router],
  );

  return { filters, update };
}
