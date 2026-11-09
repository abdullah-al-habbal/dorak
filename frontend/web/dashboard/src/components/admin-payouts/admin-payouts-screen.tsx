"use client";

import { WalletIcon } from "lucide-react";
import type { JSX } from "react";

import { AdminPayoutList } from "@/components/admin-payouts/admin-payout-list";
import { EmptyState } from "@/components/common/empty-state";
import { ErrorState } from "@/components/common/error-state";
import { LoadingButton } from "@/components/buttons/loading-button";
import { NativeSelect } from "@/components/ui/native-select";
import { PaginationBar } from "@/components/ui/table/pagination-bar";
import { TableSkeleton } from "@/components/ui/table/table-skeleton";
import { OverlayKind } from "@/enums/overlay-kind.enum";
import type { PayoutAction } from "@/enums/payout-action.enum";
import { PayoutStatus } from "@/enums/payout-status.enum";
import { useAdminPayouts } from "@/hooks/use-admin-payouts";
import { useGeneratePayouts } from "@/hooks/use-generate-payouts";
import { useI18n } from "@/hooks/use-i18n";
import { useOverlay } from "@/hooks/use-overlay";
import { usePayoutFilters } from "@/hooks/use-payout-filters";
import type { AdminPayout } from "@/types/admin-payout.type";

/** The platform admin's payout queue: every status (drafts included), with approve, pay and cancel actions. */
export function AdminPayoutsScreen(): JSX.Element {
  const { dictionary } = useI18n();
  const { adminPayouts: t, payouts: shared, common } = dictionary;
  const { filters, update } = usePayoutFilters();
  const overlay = useOverlay();
  const generate = useGeneratePayouts();
  const query = useAdminPayouts(filters);
  const clear = () => update({ status: undefined });
  const changePage = (page: number) => update({ page });
  const openAction = (payout: AdminPayout, action: PayoutAction) => overlay.open({ kind: OverlayKind.PayoutAction, payout, action });
  const confirmGenerate = () =>
    overlay.open({
      kind: OverlayKind.Confirm,
      title: t.generateConfirm.title,
      description: t.generateConfirm.body,
      confirmLabel: t.generateConfirm.confirm,
      onConfirm: async () => {
        await generate.mutateAsync();
      },
    });
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
          <NativeSelect value={filters.status ?? ""} onChange={(event) => update({ status: Object.values(PayoutStatus).find((status) => status === event.target.value) })}>
            <option value="">{t.filters.allStatuses}</option>
            {Object.values(PayoutStatus).map((status) => (
              <option key={status} value={status}>{shared.status[status]}</option>
            ))}
          </NativeSelect>
        </label>
        <LoadingButton className="ms-auto" loading={generate.isPending} loadingLabel={common.loading} onClick={confirmGenerate}>
          <WalletIcon aria-hidden data-icon="inline-start" />
          {t.generate}
        </LoadingButton>
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
            <AdminPayoutList payouts={items} onAction={openAction} />
            {page ? <PaginationBar page={page.current_page} totalPages={page.total_pages} label={t.title} onPageChange={changePage} /> : null}
          </>
        ) : null}
      </div>
    </div>
  );
}
