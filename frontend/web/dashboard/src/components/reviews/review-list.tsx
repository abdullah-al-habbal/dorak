"use client";

import type { JSX } from "react";

import { RatingStars } from "@/components/reviews/rating-stars";
import { Button } from "@/components/ui/button";
import { ReviewStatusBadge } from "@/components/reviews/review-status-badge";
import { ReviewStatus } from "@/enums/review-status.enum";
import { useI18n } from "@/hooks/core/use-i18n";
import { REVIEW_MAX_RATING } from "@/config/review.constant";
import type { Review } from "@/types/clients/review.type";

interface ReviewListProps {
  reviews: readonly Review[];
  /** Present when the viewer may dispute; only a published review offers it. */
  onDispute?: (review: Review) => void;
}

export function ReviewList({ reviews, onDispute }: ReviewListProps): JSX.Element {
  const { locale, dictionary } = useI18n();
  const { reviews: t } = dictionary;
  const date = new Intl.DateTimeFormat(locale, { dateStyle: "medium" });

  return (
    <ul aria-label={t.title} className="flex flex-col divide-y divide-border overflow-hidden rounded-xl border border-border bg-card">
      {reviews.map((review) => (
        <li key={review.id} className="flex flex-col gap-2 p-4">
          <div className="flex flex-wrap items-center gap-x-3 gap-y-1">
            <RatingStars rating={review.rating} label={t.rating.replace("{rating}", String(review.rating)).replace("{max}", String(REVIEW_MAX_RATING))} />
            <span dir="auto" className="min-w-0 truncate font-medium">{review.author_name || t.anonymous}</span>
            <time dateTime={review.created_at} className="tabular ms-auto text-xs text-muted-foreground">{date.format(new Date(review.created_at))}</time>
          </div>
          {review.body ? <p dir="auto" className="break-words text-sm">{review.body}</p> : null}
          {review.status && review.status !== ReviewStatus.Published ? <div><ReviewStatusBadge status={review.status} /></div> : null}
          {onDispute && review.status === ReviewStatus.Published ? (
            <div>
              <Button type="button" size="sm" variant="outline" onClick={() => onDispute(review)}>{t.dispute.action}</Button>
            </div>
          ) : null}
        </li>
      ))}
    </ul>
  );
}
