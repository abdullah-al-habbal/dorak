"use client";

import { useUrlFilters } from "@/hooks/use-url-filters";
import { reviewModerationFiltersFromParams, reviewModerationFiltersToParams } from "@/lib/review-moderation-filters.util";
import type { ReviewModerationFilters } from "@/types/clients/review-moderation-filters.type";

export function useReviewModerationFilters(): { filters: ReviewModerationFilters; update: (patch: Partial<ReviewModerationFilters>) => void } {
  return useUrlFilters(reviewModerationFiltersFromParams, reviewModerationFiltersToParams);
}
