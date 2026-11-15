"use client";

import type { JSX } from "react";

import { EmptyState } from "@/components/common/empty-state";
import { ErrorState } from "@/components/common/error-state";
import { ReviewModerationList } from "@/components/review-moderation/review-moderation-list";
import { NativeSelect } from "@/components/ui/native-select";
import { PaginationBar } from "@/components/ui/table/pagination-bar";
import { TableSkeleton } from "@/components/ui/table/table-skeleton";
import { DEFAULT_REVIEW_MODERATION_STATUS } from "@/config/platform/review-moderation.constant";
import { OverlayKind } from "@/enums/ui/overlay-kind.enum";
import { ReviewStatus } from "@/enums/people/review-status.enum";
import { useI18n } from "@/hooks/core/state/use-i18n";
import { useOverlay } from "@/hooks/core/state/use-overlay";
import { useReviewModeration } from "@/hooks/clients/reviews/use-review-moderation";
import { useReviewModerationFilters } from "@/hooks/clients/reviews/use-review-moderation-filters";
import type { AdminReview } from "@/types/clients/reviews/admin-review.type";

function toStatus(value: string): ReviewStatus {
  return Object.values(ReviewStatus).find((status) => status === value) ?? DEFAULT_REVIEW_MODERATION_STATUS;
}

/** The platform admin's moderation queue: disputed reviews first, resolved in a dialog. */
export function ReviewModerationScreen(): JSX.Element {
  const { dictionary } = useI18n();
  const { reviewModeration: t, reviews } = dictionary;
  const { filters, update } = useReviewModerationFilters();
  const overlay = useOverlay();
  const query = useReviewModeration(filters);
  const items = query.data?.items ?? [];
  const page = query.data?.page;
  const open = (review: AdminReview) => overlay.open({ kind: OverlayKind.ReviewResolve, review });

  return (
    <div className="flex flex-col gap-5">
      <div className="flex flex-col gap-1">
        <h1 className="font-heading text-3xl font-semibold">{t.title}</h1>
        <p className="max-w-prose text-sm text-muted-foreground">{t.description}</p>
      </div>

      <label className="w-full sm:w-52">
        <span className="sr-only">{t.filters.status}</span>
        <NativeSelect value={filters.status} onChange={(event) => update({ status: toStatus(event.target.value) })}>
          {Object.values(ReviewStatus).map((status) => (
            <option key={status} value={status}>{reviews.status[status]}</option>
          ))}
        </NativeSelect>
      </label>

      <div aria-busy={query.isFetching} className="flex flex-col gap-4">
        {query.isPending ? <TableSkeleton /> : null}
        {query.isError && items.length === 0 ? <ErrorState title={t.states.errorTitle} body={t.states.errorBody} onRetry={() => query.refetch()} /> : null}
        {query.data && items.length === 0 ? (
          filters.status === DEFAULT_REVIEW_MODERATION_STATUS ? (
            <EmptyState title={t.states.emptyTitle} body={t.states.emptyBody} />
          ) : (
            <EmptyState variant="filtered" title={t.states.filteredTitle} body={t.states.filteredBody} onClear={() => update({ status: DEFAULT_REVIEW_MODERATION_STATUS })} clearLabel={t.filters.clear} />
          )
        ) : null}
        {items.length > 0 ? (
          <>
            <p className="tabular text-sm text-muted-foreground" aria-live="polite">{t.states.results.replace("{count}", String(page?.total ?? items.length))}</p>
            <ReviewModerationList reviews={items} onSelect={open} />
            {page ? <PaginationBar page={page.current_page} totalPages={page.total_pages} label={t.title} onPageChange={(next) => update({ page: next })} /> : null}
          </>
        ) : null}
      </div>
    </div>
  );
}
