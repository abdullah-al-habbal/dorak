"use client";

import { useUrlFilters } from "@/hooks/core/state/use-url-filters";
import { feedbackFiltersFromParams, feedbackFiltersToParams } from "@/lib/support/feedback-filters.util";
import type { FeedbackFilters } from "@/types/support/feedback-filters.type";

/** The URL is the source of truth for the filters, the search and the page. */
export function useFeedbackFilters(): { filters: FeedbackFilters; update: (patch: Partial<FeedbackFilters>) => void } {
  return useUrlFilters(feedbackFiltersFromParams, feedbackFiltersToParams);
}
