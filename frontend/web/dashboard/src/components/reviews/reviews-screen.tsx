"use client";

import { useMemo } from "react";
import type { JSX } from "react";

import { EmptyState } from "@/components/common/empty-state";
import { ErrorState } from "@/components/common/error-state";
import { FormField } from "@/components/common/form-field";
import { ReviewModerationScreen } from "@/components/review-moderation/review-moderation-screen";
import { RatingSummary } from "@/components/reviews/rating-summary";
import { ReviewList } from "@/components/reviews/review-list";
import { NativeSelect } from "@/components/ui/native-select";
import { PaginationBar } from "@/components/ui/table/pagination-bar";
import { TableSkeleton } from "@/components/ui/table/table-skeleton";
import { AuthActor } from "@/enums/auth-actor.enum";
import { OverlayKind } from "@/enums/overlay-kind.enum";
import { useBranchOptions } from "@/hooks/branches/use-branch-options";
import { useI18n } from "@/hooks/core/use-i18n";
import { useOverlay } from "@/hooks/core/use-overlay";
import { useReviewFilters } from "@/hooks/clients/use-review-filters";
import { useReviews } from "@/hooks/clients/use-reviews";
import { useAuthStore } from "@/store/auth.store";
import type { Review } from "@/types/clients/review.type";

export function ReviewsScreen({ actor }: { actor: AuthActor }): JSX.Element {
  const { dictionary } = useI18n();
  if (actor === AuthActor.Admin) return <ReviewModerationScreen />;
  if (actor === AuthActor.Barber) {
    const { states } = dictionary.reviews;
    return <EmptyState variant="forbidden" title={states.forbiddenTitle} body={states.forbiddenBody} />;
  }
  return <ReviewsContent />;
}

function ReviewsContent(): JSX.Element {
  const { dictionary } = useI18n();
  const { reviews: t } = dictionary;
  const { filters, update } = useReviewFilters();
  const ownBranchId = useAuthStore((state) => state.profile?.branch_id ?? null);
  const choosingBranch = ownBranchId === null;
  const options = useBranchOptions(choosingBranch);
  const branches = useMemo(() => options.data ?? [], [options.data]);
  const branchId = ownBranchId ?? filters.branchId ?? branches[0]?.id ?? null;
  const query = useReviews(branchId, filters.page);
  const changeBranch = (id: string) => update({ branchId: id });
  const changePage = (page: number) => update({ page });
  const overlay = useOverlay();
  const openDispute = (review: Review) => {
    if (branchId !== null) overlay.open({ kind: OverlayKind.ReviewDispute, branchId, review });
  };

  const noBranch = choosingBranch && options.isSuccess && branches.length === 0;
  const loading = (choosingBranch && options.isPending) || (branchId !== null && query.isPending);
  const failed = options.isError || (query.isError && !query.data);
  const retry = (): void => {
    if (options.isError) void options.refetch();
    if (query.isError) void query.refetch();
  };
  const items = query.data?.items ?? [];
  const page = query.data?.page;

  return (
    <div className="flex flex-col gap-5">
      <div className="flex flex-col gap-1">
        <h1 className="font-heading text-3xl font-semibold">{t.title}</h1>
        <p className="max-w-prose text-sm text-muted-foreground">{t.description}</p>
      </div>

      {choosingBranch && branches.length > 1 ? (
        <FormField id="reviews-branch" label={t.branch}>
          <NativeSelect id="reviews-branch" value={branchId ?? ""} onChange={(event) => changeBranch(event.target.value)} className="sm:max-w-xs">
            {branches.map((branch) => (
              <option key={branch.id} value={branch.id}>{branch.name}</option>
            ))}
          </NativeSelect>
        </FormField>
      ) : null}

      {loading ? <TableSkeleton /> : null}
      {failed ? <ErrorState title={t.states.errorTitle} body={t.states.errorBody} onRetry={retry} /> : null}
      {noBranch ? <EmptyState title={t.states.noBranchTitle} body={t.states.noBranchBody} /> : null}

      {query.data ? (
        <div aria-busy={query.isFetching} className="flex flex-col gap-4">
          <RatingSummary summary={query.data.summary} />
          {items.length === 0 ? (
            <EmptyState title={t.states.emptyTitle} body={t.states.emptyBody} />
          ) : (
            <>
              <p className="tabular text-sm text-muted-foreground" aria-live="polite">{t.states.results.replace("{count}", String(page?.total ?? items.length))}</p>
              <ReviewList reviews={items} onDispute={openDispute} />
              {page ? <PaginationBar page={page.current_page} totalPages={page.total_pages} label={t.title} onPageChange={changePage} /> : null}
            </>
          )}
        </div>
      ) : null}
    </div>
  );
}
