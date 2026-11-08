"use client";

import type { UseQueryResult } from "@tanstack/react-query";

import { useListQuery } from "@/hooks/use-list-query";
import { reviewKeys } from "@/lib/review-keys";
import { fetchReviewPage } from "@/services/api/query/review-page.query";
import type { ReviewPage } from "@/types/review-page.type";

/** Disabled until a branch is known. */
export function useReviews(branchId: string | null, page: number): UseQueryResult<ReviewPage> {
  return useListQuery(reviewKeys.list(branchId ?? "", page), () => fetchReviewPage(branchId ?? "", page), branchId !== null);
}
