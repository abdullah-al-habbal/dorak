"use client";

import type { JSX } from "react";

import { EmptyState } from "@/components/common/empty-state";
import { ErrorState } from "@/components/common/error-state";
import { FeedbackList } from "@/components/support/feedback-list";
import { FeedbackToolbar } from "@/components/support/feedback-toolbar";
import { PaginationBar } from "@/components/ui/table/pagination-bar";
import { TableSkeleton } from "@/components/ui/table/table-skeleton";
import { FEEDBACK_FILTER_ALL } from "@/config/support/feedback.constant";
import { AuthActor } from "@/enums/access/auth-actor.enum";
import { OverlayKind } from "@/enums/ui/overlay-kind.enum";
import { useI18n } from "@/hooks/core/state/use-i18n";
import { useOverlay } from "@/hooks/core/state/use-overlay";
import { useFeedbackFilters } from "@/hooks/support/use-feedback-filters";
import { useFeedbackReports } from "@/hooks/support/use-feedback-reports";
import { hasFeedbackFilters } from "@/lib/support/feedback-filters.util";
import type { FeedbackReport } from "@/types/support/feedback-report.type";

/** The support inbox is for platform admins only; the proxy and the backend refuse everyone else too. */
export function FeedbackScreen({ actor }: { actor: AuthActor }): JSX.Element {
  const { dictionary } = useI18n();
  if (actor !== AuthActor.Admin) {
    const { states } = dictionary.support;
    return <EmptyState variant="forbidden" title={states.forbiddenTitle} body={states.forbiddenBody} />;
  }
  return <FeedbackContent />;
}

function FeedbackContent(): JSX.Element {
  const { dictionary } = useI18n();
  const { support: t } = dictionary;
  const { filters, update } = useFeedbackFilters();
  const overlay = useOverlay();
  const query = useFeedbackReports(filters);
  const clear = () => update({ kind: FEEDBACK_FILTER_ALL, status: FEEDBACK_FILTER_ALL, app: FEEDBACK_FILTER_ALL, platform: FEEDBACK_FILTER_ALL, search: undefined, page: 1 });
  const items = query.data?.items ?? [];
  const page = query.data?.page;

  return (
    <div className="flex flex-col gap-5">
      <div className="flex flex-col gap-1">
        <h1 className="font-heading text-3xl font-semibold">{t.title}</h1>
        <p className="max-w-prose text-sm text-muted-foreground">{t.description}</p>
      </div>

      <FeedbackToolbar filters={filters} onChange={update} />

      <div aria-busy={query.isFetching} className="flex flex-col gap-4">
        {query.isPending ? <TableSkeleton /> : null}
        {query.isError && items.length === 0 ? <ErrorState title={t.states.errorTitle} body={t.states.errorBody} onRetry={() => query.refetch()} /> : null}
        {query.data && items.length === 0 ? (
          hasFeedbackFilters(filters) ? (
            <EmptyState variant="filtered" title={t.states.filteredTitle} body={t.states.filteredBody} onClear={clear} clearLabel={t.filters.clear} />
          ) : (
            <EmptyState title={t.states.emptyTitle} body={t.states.emptyBody} />
          )
        ) : null}
        {items.length > 0 ? (
          <>
            <p className="tabular text-sm text-muted-foreground" aria-live="polite">{t.states.results.replace("{count}", String(page?.total ?? items.length))}</p>
            <FeedbackList reports={items} onSelect={(report: FeedbackReport) => overlay.open({ kind: OverlayKind.FeedbackDetail, report })} />
            {page ? <PaginationBar page={page.current_page} totalPages={page.total_pages} label={t.title} onPageChange={(next) => update({ page: next })} /> : null}
          </>
        ) : null}
      </div>
    </div>
  );
}
