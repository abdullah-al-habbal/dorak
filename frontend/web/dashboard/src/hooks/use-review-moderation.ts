"use client";

import type { UseQueryResult } from "@tanstack/react-query";

import { useListQuery } from "@/hooks/use-list-query";
import { reviewModerationKeys } from "@/lib/query-keys/clients/review-moderation-keys";
import { fetchAdminReviewPage } from "@/services/api/query/admin-review-page.query";
import type { AdminReviewPage } from "@/types/admin-review-page.type";
import type { ReviewModerationFilters } from "@/types/review-moderation-filters.type";

export function useReviewModeration(filters: ReviewModerationFilters): UseQueryResult<AdminReviewPage> {
  return useListQuery(reviewModerationKeys.list(filters), () => fetchAdminReviewPage(filters));
}
