"use client";

import type { JSX } from "react";

import { AdminPayoutsScreen } from "@/components/admin-payouts/admin-payouts-screen";
import { EmptyState } from "@/components/common/empty-state";
import { ErrorState } from "@/components/common/error-state";
import { PayoutList } from "@/components/payouts/payout-list";
import { NativeSelect } from "@/components/ui/native-select";
import { PaginationBar } from "@/components/ui/table/pagination-bar";
import { TableSkeleton } from "@/components/ui/table/table-skeleton";
import { AuthActor } from "@/enums/auth-actor.enum";
import { PayoutStatus } from "@/enums/payout-status.enum";
import { useI18n } from "@/hooks/core/use-i18n";
import { usePayoutFilters } from "@/hooks/earnings/use-payout-filters";
import { usePayouts } from "@/hooks/earnings/use-payouts";

/** Drafts are internal, so the status filter never offers them. */
const FILTER_STATUSES: readonly PayoutStatus[] = [PayoutStatus.Approved, PayoutStatus.Paid, PayoutStatus.Cancelled];

export function PayoutsScreen({ actor }: { actor: AuthActor }): JSX.Element {
  const { dictionary } = useI18n();
  if (actor === AuthActor.Admin) return <AdminPayoutsScreen />;
  if (actor !== AuthActor.Owner) {
    const { states } = dictionary.payouts;
    return <EmptyState variant="forbidden" title={states.forbiddenTitle} body={states.forbiddenBody} />;
  }
  return <PayoutsContent />;
}

function PayoutsContent(): JSX.Element {
  const { dictionary } = useI18n();
  const { payouts: t } = dictionary;
  const { filters, update } = usePayoutFilters();
  const query = usePayouts(filters);
  const clear = () => update({ status: undefined });
  const changePage = (page: number) => update({ page });
  const items = query.data?.items ?? [];
  const page = query.data?.page;

  return (
    <div className="flex flex-col gap-5">
      <div className="flex flex-col gap-1">
        <h1 className="font-heading text-3xl font-semibold">{t.title}</h1>
        <p className="max-w-prose text-sm text-muted-foreground">{t.description}</p>
      </div>

      <div role="group" aria-label={t.filters.toolbar} className="flex flex-wrap items-center gap-2">
        <label className="w-full sm:w-52">
          <span className="sr-only">{t.filters.status}</span>
          <NativeSelect value={filters.status ?? ""} onChange={(event) => update({ status: FILTER_STATUSES.find((status) => status === event.target.value) })}>
            <option value="">{t.filters.allStatuses}</option>
            {FILTER_STATUSES.map((status) => (
              <option key={status} value={status}>{t.status[status]}</option>
            ))}
          </NativeSelect>
        </label>
      </div>

      <div aria-busy={query.isFetching} className="flex flex-col gap-4">
        {query.isPending ? <TableSkeleton /> : null}
        {query.isError && items.length === 0 ? <ErrorState title={t.states.errorTitle} body={t.states.errorBody} onRetry={() => query.refetch()} /> : null}
        {query.data && items.length === 0 ? (
          filters.status ? (
            <EmptyState variant="filtered" title={t.states.filteredTitle} body={t.states.filteredBody} onClear={clear} clearLabel={t.filters.clear} />
          ) : (
            <EmptyState title={t.states.emptyTitle} body={t.states.emptyBody} />
          )
        ) : null}
        {items.length > 0 ? (
          <>
            <p className="tabular text-sm text-muted-foreground" aria-live="polite">{t.states.results.replace("{count}", String(page?.total ?? items.length))}</p>
            <PayoutList payouts={items} />
            {page ? <PaginationBar page={page.current_page} totalPages={page.total_pages} label={t.title} onPageChange={changePage} /> : null}
          </>
        ) : null}
      </div>
    </div>
  );
}
