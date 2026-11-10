"use client";

import { GavelIcon } from "lucide-react";
import { useMemo } from "react";
import type { JSX } from "react";

import { RatingStars } from "@/components/reviews/rating-stars";
import { ReviewStatusBadge } from "@/components/reviews/review-status-badge";
import { Button } from "@/components/ui/button";
import { DataTable } from "@/components/ui/table/data-table";
import { REVIEW_MAX_RATING } from "@/config/review.constant";
import { ReviewStatus } from "@/enums/review-status.enum";
import { useI18n } from "@/hooks/use-i18n";
import type { DataTableColumn } from "@/interfaces/data-table-column.interface";
import type { AdminReview } from "@/types/admin-review.type";

interface ReviewModerationListProps {
  reviews: readonly AdminReview[];
  onSelect: (review: AdminReview) => void;
}

function getReviewId(review: AdminReview): string {
  return review.id;
}

export function ReviewModerationList({ reviews, onSelect }: ReviewModerationListProps): JSX.Element {
  const { locale, dictionary } = useI18n();
  const { reviewModeration: t, reviews: r } = dictionary;

  const columns = useMemo<DataTableColumn<AdminReview>[]>(() => {
    const date = new Intl.DateTimeFormat(locale, { dateStyle: "medium" });
    return [
      {
        id: "review",
        header: t.columns.review,
        primary: true,
        cell: (review) => (
          <div className="flex min-w-0 flex-col gap-1">
            <RatingStars rating={review.rating} label={r.rating.replace("{rating}", String(review.rating)).replace("{max}", String(REVIEW_MAX_RATING))} />
            <span dir="auto" className="line-clamp-2 break-words text-sm">{review.body || t.none}</span>
          </div>
        ),
      },
      { id: "author", header: t.columns.author, cell: (review) => <span dir="auto" className="truncate">{review.author_name || r.anonymous}</span> },
      { id: "subject", header: t.columns.subject, cell: (review) => <span dir="auto" className="truncate text-muted-foreground">{review.subject_name || t.none}</span> },
      { id: "dispute", header: t.columns.dispute, cell: (review) => <span dir="auto" className="line-clamp-2 break-words text-sm text-muted-foreground">{review.dispute_reason || t.none}</span> },
      { id: "status", header: t.columns.status, cell: (review) => (review.status ? <ReviewStatusBadge status={review.status} /> : null) },
      { id: "date", header: t.columns.date, cell: (review) => <span className="tabular text-sm text-muted-foreground">{date.format(new Date(review.disputed_at ?? review.created_at))}</span> },
      {
        id: "actions",
        header: t.columns.actions,
        interactive: true,
        align: "end",
        cell: (review) =>
          review.status === ReviewStatus.Disputed ? (
            <Button size="sm" aria-label={t.rowResolve.replace("{author}", review.author_name || r.anonymous)} onClick={() => onSelect(review)}>
              <GavelIcon aria-hidden data-icon="inline-start" />
              {t.resolve}
            </Button>
          ) : null,
      },
    ];
  }, [locale, onSelect, r, t]);

  return <DataTable caption={t.title} columns={columns} rows={reviews} getRowId={getReviewId} onRowSelect={onSelect} rowLabel={(review) => t.rowLabel.replace("{author}", review.author_name || r.anonymous)} />;
}
