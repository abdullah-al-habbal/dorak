"use client";

import { usePathname, useRouter, useSearchParams } from "next/navigation";
import { useCallback, useMemo } from "react";

import { reviewFiltersFromParams, reviewFiltersToParams } from "@/lib/review-filters.util";
import type { ReviewFilters } from "@/types/review-filters.type";

/** The URL is the source of truth for the branch and page. */
export function useReviewFilters(): { filters: ReviewFilters; update: (patch: Partial<ReviewFilters>) => void } {
  const router = useRouter();
  const pathname = usePathname();
  const params = useSearchParams();
  const filters = useMemo(() => reviewFiltersFromParams(new URLSearchParams(params.toString())), [params]);

  const update = useCallback(
    (patch: Partial<ReviewFilters>) => {
      const resetsPage = Object.keys(patch).some((key) => key !== "page");
      const query = reviewFiltersToParams({ ...filters, ...(resetsPage ? { page: 1 } : {}), ...patch }).toString();
      router.replace(query ? `${pathname}?${query}` : pathname, { scroll: false });
    },
    [filters, pathname, router],
  );

  return { filters, update };
}
