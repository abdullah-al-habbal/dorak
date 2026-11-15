"use client";

import { PlusIcon, Trash2Icon } from "lucide-react";
import type { JSX } from "react";

import { EmptyState } from "@/components/common/empty-state";
import { ErrorState } from "@/components/common/error-state";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { TableSkeleton } from "@/components/ui/table/table-skeleton";
import { OverlayKind } from "@/enums/overlay-kind.enum";
import { useExchangeRates } from "@/hooks/platform/use-admin-currencies";
import { useDeleteExchangeRate } from "@/hooks/platform/use-delete-exchange-rate";
import { useI18n } from "@/hooks/core/use-i18n";
import { useOverlay } from "@/hooks/core/use-overlay";
import { currentRateIds } from "@/lib/exchange-rate.util";
import type { ExchangeRate } from "@/types/platform/currency-admin.type";

/** The rate history, newest first. The rate the converter uses for each pair is marked "current". */
export function RatesPanel(): JSX.Element {
  const { dictionary, locale } = useI18n();
  const { currencies: t } = dictionary;
  const overlay = useOverlay();
  const query = useExchangeRates();
  const remove = useDeleteExchangeRate();
  const items = query.data ?? [];
  const current = currentRateIds(items, new Date());

  function confirmDelete(rate: ExchangeRate): void {
    overlay.open({
      kind: OverlayKind.Confirm,
      title: t.confirm.deleteRateTitle,
      description: t.confirm.deleteRateBody,
      confirmLabel: t.confirm.deleteRate,
      destructive: true,
      onConfirm: async () => {
        await remove.mutateAsync(rate.id);
      },
    });
  }

  return (
    <div className="flex flex-col gap-4">
      <div className="flex justify-end">
        <Button type="button" onClick={() => overlay.open({ kind: OverlayKind.ExchangeRateForm })}>
          <PlusIcon aria-hidden data-icon="inline-start" />
          {t.addRate}
        </Button>
      </div>
      <div aria-busy={query.isFetching} className="flex flex-col gap-4">
        {query.isPending ? <TableSkeleton /> : null}
        {query.isError ? <ErrorState title={t.states.errorTitle} body={t.states.errorBody} onRetry={() => query.refetch()} /> : null}
        {query.data && items.length === 0 ? <EmptyState title={t.states.noRatesTitle} body={t.states.noRatesBody} /> : null}
        {items.length > 0 ? (
          <ul aria-label={t.tabs.rates} className="flex flex-col divide-y divide-border overflow-hidden rounded-xl border border-border bg-card">
            {items.map((rate) => (
              <li key={rate.id} className="flex flex-wrap items-center justify-between gap-3 p-4">
                <div className="flex min-w-0 flex-col gap-1">
                  <span dir="ltr" className="tabular font-medium">{`1 ${rate.from_currency_code} = ${Number(rate.rate_ratio)} ${rate.to_currency_code}`}</span>
                  <span className="flex flex-wrap items-center gap-2 text-sm text-muted-foreground">
                    {rate.effective_at ? <time dateTime={rate.effective_at} className="tabular">{new Intl.DateTimeFormat(locale, { dateStyle: "medium", timeStyle: "short" }).format(new Date(rate.effective_at))}</time> : null}
                    {current.has(rate.id) ? <Badge variant="success">{t.current}</Badge> : null}
                  </span>
                </div>
                <Button type="button" size="sm" variant="ghost" className="text-destructive" disabled={remove.isPending} onClick={() => confirmDelete(rate)}>
                  <Trash2Icon aria-hidden data-icon="inline-start" />
                  {t.confirm.deleteRate}
                </Button>
              </li>
            ))}
          </ul>
        ) : null}
      </div>
    </div>
  );
}
