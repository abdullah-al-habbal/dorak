"use client";

import { useUrlFilters } from "@/hooks/core/state/use-url-filters";
import { reviewFiltersFromParams, reviewFiltersToParams } from "@/lib/clients/review-filters.util";
import type { ReviewFilters } from "@/types/clients/reviews/review-filters.type";

/** The URL is the source of truth for the branch and page. */
export function useReviewFilters(): { filters: ReviewFilters; update: (patch: Partial<ReviewFilters>) => void } {
  return useUrlFilters(reviewFiltersFromParams, reviewFiltersToParams);
}
