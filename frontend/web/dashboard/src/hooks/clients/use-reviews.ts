"use client";

import type { UseQueryResult } from "@tanstack/react-query";

import { useListQuery } from "@/hooks/core/use-list-query";
import { reviewKeys } from "@/lib/query-keys/clients/review-keys";
import { fetchReviewPage } from "@/services/api/query/clients/review-page.query";
import type { ReviewPage } from "@/types/clients/review-page.type";

/** Disabled until a branch is known. */
export function useReviews(branchId: string | null, page: number): UseQueryResult<ReviewPage> {
  return useListQuery(reviewKeys.list(branchId ?? "", page), () => fetchReviewPage(branchId ?? "", page), branchId !== null);
}
