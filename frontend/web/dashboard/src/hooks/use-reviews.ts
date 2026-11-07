"use client";

import { keepPreviousData, useQuery } from "@tanstack/react-query";
import type { UseQueryResult } from "@tanstack/react-query";

import { reviewKeys } from "@/lib/review-keys";
import { fetchReviewPage } from "@/services/api/query/review-page.query";
import type { ReviewPage } from "@/types/review-page.type";

/** Disabled until a branch is known. */
export function useReviews(branchId: string | null, page: number): UseQueryResult<ReviewPage> {
  return useQuery({
    queryKey: reviewKeys.list(branchId ?? "", page),
    queryFn: () => fetchReviewPage(branchId ?? "", page),
    enabled: branchId !== null,
    placeholderData: keepPreviousData,
  });
}
