"use client";

import { BranchPicker } from "@/components/branches/branch-picker";
import { Card, CardContent } from "@/components/tailgrids/core/card";
import { Pagination } from "@/components/tailgrids/core/pagination";
import { useDictionary } from "@/hooks/use-dictionary";
import { useSelectedBranch } from "@/hooks/use-selected-branch";
import { apiErrorMessage } from "@/services/api/core/api-error-message.util";
import {
  branchReviewsQueryKey,
  getBranchReviews,
} from "@/services/api/dashboard/review/review.query";
import { useQuery } from "@tanstack/react-query";
import { useState } from "react";

export function BranchReviewsPage() {
  const dictionary = useDictionary();
  const copy = dictionary.branchReviews;
  const { branches, branchId, selectBranch, isLoading } =
    useSelectedBranch("reviews");
  const [page, setPage] = useState(1);
  const reviews = useQuery({
    enabled: branchId !== undefined,
    queryKey: branchReviewsQueryKey(branchId ?? "", page),
    queryFn: () => getBranchReviews(branchId ?? "", page),
  });

  return (
    <section className="space-y-6">
      <h1 className="text-2xl font-semibold text-title-50">{copy.title}</h1>
      {!isLoading && branches.length === 0 ? (
        <p className="text-text-secondary">{copy.noBranches}</p>
      ) : (
        <BranchPicker
          label={copy.branch}
          branches={branches}
          value={branchId}
          onChange={(id) => {
            setPage(1);
            selectBranch(id);
          }}
        />
      )}
      {reviews.isPending && branchId !== undefined ? (
        <p className="text-text-secondary">{copy.loading}</p>
      ) : null}
      {reviews.isError ? (
        <p role="alert">{apiErrorMessage(reviews.error, dictionary)}</p>
      ) : null}
      {reviews.data?.items.length === 0 ? (
        <p className="text-text-secondary">{copy.empty}</p>
      ) : null}
      <ul className="space-y-3">
        {reviews.data?.items.map((review) => (
          <li key={review.id}>
            <Card>
              <CardContent className="space-y-1 pt-4 text-sm">
                <div className="flex justify-between">
                  <strong>{review.authorName ?? copy.anonymous}</strong>
                  <span>
                    {copy.rating}: {review.rating}/5
                  </span>
                </div>
                {review.body ? <p>{review.body}</p> : null}
                <time
                  className="text-text-secondary"
                  dateTime={review.createdAt}
                >
                  {review.createdAt.slice(0, 10)}
                </time>
              </CardContent>
            </Card>
          </li>
        ))}
      </ul>
      {reviews.data ? (
        <Pagination
          currentPage={reviews.data.pagination.currentPage}
          totalPages={reviews.data.pagination.totalPages}
          onPageChange={setPage}
          labels={dictionary.common.pagination}
        />
      ) : null}
    </section>
  );
}
