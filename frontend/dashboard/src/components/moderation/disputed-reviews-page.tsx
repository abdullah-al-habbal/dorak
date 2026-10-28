"use client";

import { ResolveDisputeDialog } from "@/components/moderation/resolve-dispute-dialog";
import { Badge } from "@/components/tailgrids/core/badge";
import { Card, CardContent } from "@/components/tailgrids/core/card";
import { Pagination } from "@/components/tailgrids/core/pagination";
import { useDictionary } from "@/hooks/use-dictionary";
import { apiErrorMessage } from "@/services/api/core/api-error-message.util";
import {
  disputedReviewsQueryKey,
  getDisputedReviews,
} from "@/services/api/dashboard/moderation/moderation.query";
import type { IDisputedReview } from "@/services/api/dashboard/moderation/types/imoderation.types";
import { useQuery } from "@tanstack/react-query";
import { useState } from "react";

export function DisputedReviewsPage() {
  const dictionary = useDictionary();
  const copy = dictionary.moderation.disputes;
  const [page, setPage] = useState(1);
  const list = useQuery({
    queryKey: disputedReviewsQueryKey(page),
    queryFn: () => getDisputedReviews(page),
  });

  return (
    <section className="space-y-6">
      <h1 className="text-2xl font-semibold text-title-50">{copy.title}</h1>
      {list.isPending ? (
        <p className="text-text-secondary">{dictionary.people.loading}</p>
      ) : null}
      {list.isError ? (
        <p role="alert">{apiErrorMessage(list.error, dictionary)}</p>
      ) : null}
      {list.data?.items.length === 0 ? (
        <p className="text-text-secondary">{copy.empty}</p>
      ) : null}
      <ul className="space-y-3">
        {list.data?.items.map((review) => (
          <li key={review.id}>
            <DisputedReviewRow review={review} />
          </li>
        ))}
      </ul>
      {list.data ? (
        <Pagination
          currentPage={list.data.pagination.currentPage}
          totalPages={list.data.pagination.totalPages}
          onPageChange={setPage}
          labels={dictionary.common.pagination}
        />
      ) : null}
    </section>
  );
}

function DisputedReviewRow({ review }: { review: IDisputedReview }) {
  const copy = useDictionary().moderation.disputes;

  return (
    <Card>
      <CardContent className="flex flex-wrap items-start justify-between gap-3 pt-4 text-sm">
        <div className="space-y-1">
          <div className="flex items-center gap-2">
            <strong>{review.authorName ?? copy.unnamedAuthor}</strong>
            <Badge>{review.rating} / 5</Badge>
          </div>
          <p>{review.comment ?? copy.noComment}</p>
          <p className="text-text-secondary">
            {copy.disputeReason}: {review.disputeReason ?? copy.noReason}
          </p>
        </div>
        <ResolveDisputeDialog reviewId={review.id} />
      </CardContent>
    </Card>
  );
}
