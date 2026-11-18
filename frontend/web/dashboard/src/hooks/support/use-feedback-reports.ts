"use client";

import type { UseQueryResult } from "@tanstack/react-query";

import { useListQuery } from "@/hooks/core/query/use-list-query";
import { feedbackKeys } from "@/lib/query-keys/support/feedback-keys";
import { fetchFeedbackPage } from "@/services/api/query/support/feedback-page.query";
import type { FeedbackFilters } from "@/types/support/feedback-filters.type";
import type { FeedbackPage } from "@/types/support/feedback-page.type";

export function useFeedbackReports(filters: FeedbackFilters): UseQueryResult<FeedbackPage> {
  return useListQuery(feedbackKeys.list(filters), () => fetchFeedbackPage(filters));
}
