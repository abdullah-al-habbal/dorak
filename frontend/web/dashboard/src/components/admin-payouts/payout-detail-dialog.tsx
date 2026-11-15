"use client";

import { useState } from "react";
import type { JSX } from "react";

import { EmptyState } from "@/components/common/empty-state";
import { ErrorState } from "@/components/common/error-state";
import { PayoutStatusBadge } from "@/components/payouts/payout-status-badge";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { PaginationBar } from "@/components/ui/table/pagination-bar";
import { TableSkeleton } from "@/components/ui/table/table-skeleton";
import { OverlayKind } from "@/enums/ui/overlay-kind.enum";
import { PayoutAction } from "@/enums/money/payout-action.enum";
import { PayoutStatus } from "@/enums/money/payout-status.enum";
import { useAdminPayoutDetail, usePayoutEntries } from "@/hooks/earnings/use-admin-payout-detail";
import { useI18n } from "@/hooks/core/state/use-i18n";
import { useOverlay } from "@/hooks/core/state/use-overlay";
import { localizedText } from "@/lib/core/format/booking-format.util";
import { money } from "@/lib/earnings/commission.util";
import { availablePayoutActions } from "@/lib/earnings/payout-actions.util";
import type { AdminPayout } from "@/types/earnings/admin-payout.type";

const FIRST_PAGE = 1;

interface TimelineStep {
  key: string;
  label: string;
  at: string | null | undefined;
  note?: string;
}

/** One payout: its period, amount, status history and the commission lines it settles, with the same actions as the list. */
export function PayoutDetailDialog({ payout, onClose }: { payout: AdminPayout; onClose: () => void }): JSX.Element {
  const { dictionary, locale } = useI18n();
  const { adminPayouts: t, payouts: shared } = dictionary;
  const d = t.detail;
  const overlay = useOverlay();
  const detail = useAdminPayoutDetail(payout.id);
  const [page, setPage] = useState(FIRST_PAGE);
  const entries = usePayoutEntries(payout.id, page);
  const current = detail.data ?? payout;
  const code = current.currency?.code ?? "";
  const date = new Intl.DateTimeFormat(locale, { dateStyle: "medium", timeStyle: "short" });
  const day = new Intl.DateTimeFormat(locale, { dateStyle: "medium" });
  const when = (iso: string | null | undefined): string => (iso ? date.format(new Date(iso)) : shared.notPaid);
  const approver = localizedText(current.approved_by?.name, locale);
  const items = entries.data?.items ?? [];
  const steps: TimelineStep[] = [
    { key: "created", label: d.created, at: current.created_at },
    ...(current.approved_at ? [{ key: "approved", label: d.approved, at: current.approved_at, note: approver ? d.by.replace("{name}", approver) : undefined }] : []),
    ...(current.paid_at ? [{ key: "paid", label: d.paid, at: current.paid_at, note: current.external_reference ? shared.reference.replace("{reference}", current.external_reference) : undefined }] : []),
    ...(current.status === PayoutStatus.Cancelled ? [{ key: "cancelled", label: d.cancelled, at: current.updated_at }] : []),
  ];

  function act(action: PayoutAction): void {
    overlay.open({ kind: OverlayKind.PayoutAction, payout: current, action });
  }

  return (
    <Dialog open onOpenChange={(open) => (open ? undefined : onClose())}>
      <DialogContent className="max-h-[90dvh] overflow-y-auto overscroll-contain sm:max-w-2xl">
        <DialogHeader>
          <DialogTitle dir="auto">{d.title.replace("{brand}", localizedText(current.brand?.name, locale) || shared.notPaid)}</DialogTitle>
          <DialogDescription className="tabular">
            {shared.periodRange.replace("{from}", current.period_started_at ? day.format(new Date(current.period_started_at)) : shared.notPaid).replace("{to}", current.period_ended_at ? day.format(new Date(current.period_ended_at)) : shared.notPaid)}
          </DialogDescription>
        </DialogHeader>
        {detail.isError ? <ErrorState title={d.errorTitle} body={d.errorBody} onRetry={() => detail.refetch()} /> : null}
        <div className="flex flex-wrap items-center justify-between gap-3">
          <span className="tabular text-2xl font-semibold">{money(current.total_amount_minor, code, locale)}</span>
          <PayoutStatusBadge status={current.status} />
        </div>
        {current.notes ? <p dir="auto" className="text-sm text-muted-foreground">{current.notes}</p> : null}
        <section aria-labelledby="payout-history" className="flex flex-col gap-2">
          <h3 id="payout-history" className="text-sm font-medium">{d.history}</h3>
          <ol className="flex flex-col gap-1 text-sm">
            {steps.map((step) => (
              <li key={step.key} className="flex flex-wrap items-baseline justify-between gap-2 border-s-2 border-border ps-3">
                <span className="font-medium">{step.label}{step.note ? <span className="font-normal text-muted-foreground">{` · ${step.note}`}</span> : null}</span>
                <time dateTime={step.at ?? undefined} className="tabular text-muted-foreground">{when(step.at)}</time>
              </li>
            ))}
          </ol>
        </section>
        <section aria-labelledby="payout-lines" className="flex flex-col gap-2">
          <h3 id="payout-lines" className="text-sm font-medium">{d.lines}</h3>
          <div aria-busy={entries.isFetching} className="flex flex-col gap-3">
            {entries.isPending ? <TableSkeleton /> : null}
            {entries.isError ? <ErrorState title={d.linesErrorTitle} body={d.errorBody} onRetry={() => entries.refetch()} /> : null}
            {entries.data && items.length === 0 ? <EmptyState title={d.noLinesTitle} body={d.noLinesBody} /> : null}
            {items.length > 0 ? (
              <>
                <ul aria-label={d.lines} className="flex flex-col divide-y divide-border overflow-hidden rounded-xl border border-border">
                  {items.map((entry) => {
                    const entryCode = entry.currency?.code ?? code;
                    return (
                      <li key={entry.id} className="flex flex-wrap items-center justify-between gap-2 p-3 text-sm">
                        <span className="flex flex-col">
                          <time dateTime={entry.created_at} className="tabular text-muted-foreground">{day.format(new Date(entry.created_at))}</time>
                          <span className="tabular text-xs text-muted-foreground">{d.base.replace("{amount}", money(entry.base_amount_minor, entryCode, locale))}</span>
                        </span>
                        <span className="tabular font-medium">{money(entry.commission_amount_minor, entryCode, locale)}</span>
                      </li>
                    );
                  })}
                </ul>
                {entries.data ? <PaginationBar page={entries.data.page.current_page} totalPages={entries.data.page.total_pages} label={d.lines} onPageChange={setPage} /> : null}
              </>
            ) : null}
          </div>
        </section>
        <div className="flex flex-wrap justify-end gap-2">
          {availablePayoutActions(current.status).map((action) => (
            <Button key={action} type="button" variant={action === PayoutAction.Cancel ? "destructive" : "default"} onClick={() => act(action)}>{t.actions[action]}</Button>
          ))}
        </div>
      </DialogContent>
    </Dialog>
  );
}
