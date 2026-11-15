"use client";

import type { JSX } from "react";

import { BarberApprovalList } from "@/components/barber-approvals/barber-approval-list";
import { BarberApprovalToolbar } from "@/components/barber-approvals/barber-approval-toolbar";
import { EmptyState } from "@/components/common/empty-state";
import { ErrorState } from "@/components/common/error-state";
import { PaginationBar } from "@/components/ui/table/pagination-bar";
import { TableSkeleton } from "@/components/ui/table/table-skeleton";
import { DEFAULT_BARBER_STATUS_FILTER } from "@/config/ops/barber-approval.constant";
import { AuthActor } from "@/enums/access/auth-actor.enum";
import { OverlayKind } from "@/enums/ui/overlay-kind.enum";
import { useBarberApprovalFilters } from "@/hooks/stylists/approvals/use-barber-approval-filters";
import { useBarberApprovals } from "@/hooks/stylists/approvals/use-barber-approvals";
import { useConfirmApproveBarber } from "@/hooks/stylists/approvals/use-confirm-approve-barber";
import { useI18n } from "@/hooks/core/state/use-i18n";
import { useOverlay } from "@/hooks/core/state/use-overlay";
import { hasBarberApprovalFilters } from "@/lib/stylists/barber-approval-filters.util";
import type { BarberApproval } from "@/types/stylists/barber-approval.type";

/** Barber review is platform-admin only; the proxy and the backend refuse everyone else too. */
export function BarberApprovalsScreen({ actor }: { actor: AuthActor }): JSX.Element {
  const { dictionary } = useI18n();
  if (actor !== AuthActor.Admin) {
    const { states } = dictionary.barberApprovals;
    return <EmptyState variant="forbidden" title={states.forbiddenTitle} body={states.forbiddenBody} />;
  }
  return <BarberApprovalsContent />;
}

function BarberApprovalsContent(): JSX.Element {
  const { dictionary } = useI18n();
  const { barberApprovals: t } = dictionary;
  const { filters, update } = useBarberApprovalFilters();
  const overlay = useOverlay();
  const confirmApprove = useConfirmApproveBarber();
  const query = useBarberApprovals(filters);
  const clear = () => update({ status: DEFAULT_BARBER_STATUS_FILTER, search: undefined });
  const changePage = (page: number) => update({ page });
  const openDetail = (barber: BarberApproval) => overlay.open({ kind: OverlayKind.BarberApprovalDetail, barber });
  const openReject = (barber: BarberApproval) => overlay.open({ kind: OverlayKind.BarberReject, barber });
  const items = query.data?.items ?? [];
  const page = query.data?.page;

  return (
    <div className="flex flex-col gap-5">
      <div className="flex flex-col gap-1">
        <h1 className="font-heading text-3xl font-semibold">{t.title}</h1>
        <p className="max-w-prose text-sm text-muted-foreground">{t.description}</p>
      </div>

      <BarberApprovalToolbar filters={filters} onChange={update} />

      <div aria-busy={query.isFetching} className="flex flex-col gap-4">
        {query.isPending ? <TableSkeleton /> : null}
        {query.isError && items.length === 0 ? <ErrorState title={t.states.errorTitle} body={t.states.errorBody} onRetry={() => query.refetch()} /> : null}
        {query.data && items.length === 0 ? (
          hasBarberApprovalFilters(filters) ? (
            <EmptyState variant="filtered" title={t.states.filteredTitle} body={t.states.filteredBody} onClear={clear} clearLabel={t.filters.clear} />
          ) : (
            <EmptyState title={t.states.emptyTitle} body={t.states.emptyBody} />
          )
        ) : null}
        {items.length > 0 ? (
          <>
            <p className="tabular text-sm text-muted-foreground" aria-live="polite">{t.states.results.replace("{count}", String(page?.total ?? items.length))}</p>
            <BarberApprovalList barbers={items} onSelect={openDetail} onApprove={confirmApprove} onReject={openReject} />
            {page ? <PaginationBar page={page.current_page} totalPages={page.total_pages} label={t.title} onPageChange={changePage} /> : null}
          </>
        ) : null}
      </div>
    </div>
  );
}
