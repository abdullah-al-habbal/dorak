"use client";

import { useUrlFilters } from "@/hooks/core/use-url-filters";
import { reviewFiltersFromParams, reviewFiltersToParams } from "@/lib/review-filters.util";
import type { ReviewFilters } from "@/types/clients/review-filters.type";

/** The URL is the source of truth for the branch and page. */
export function useReviewFilters(): { filters: ReviewFilters; update: (patch: Partial<ReviewFilters>) => void } {
  return useUrlFilters(reviewFiltersFromParams, reviewFiltersToParams);
}
