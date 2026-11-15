"use client";

import { PlusIcon } from "lucide-react";
import { useState } from "react";
import type { JSX } from "react";

import { CurrencyRow } from "@/components/currencies/currency-row";
import { RatesPanel } from "@/components/currencies/rates-panel";
import { EmptyState } from "@/components/common/empty-state";
import { ErrorState } from "@/components/common/error-state";
import { Button } from "@/components/ui/button";
import { TableSkeleton } from "@/components/ui/table/table-skeleton";
import type { CurrencyView } from "@/config/currency-admin.constant";
import { AuthActor } from "@/enums/auth-actor.enum";
import { OverlayKind } from "@/enums/overlay-kind.enum";
import { useAdminCurrencies } from "@/hooks/platform/use-admin-currencies";
import { useI18n } from "@/hooks/core/use-i18n";
import { useOverlay } from "@/hooks/core/use-overlay";
import { useSetCurrencyActive } from "@/hooks/platform/use-set-currency-active";
import type { AdminCurrency } from "@/types/platform/currency-admin.type";

/** The platform admin's currencies and exchange rates. */
export function CurrenciesScreen({ actor }: { actor: AuthActor }): JSX.Element {
  const { dictionary } = useI18n();
  const { currencies: t } = dictionary;
  if (actor !== AuthActor.Admin) return <EmptyState variant="forbidden" title={t.states.forbiddenTitle} body={t.states.forbiddenBody} />;
  return <CurrenciesContent />;
}

function CurrenciesContent(): JSX.Element {
  const { dictionary } = useI18n();
  const { currencies: t } = dictionary;
  const [view, setView] = useState<CurrencyView>("currencies");
  return (
    <div className="flex flex-col gap-5">
      <h1 className="font-heading text-3xl font-semibold">{t.title}</h1>
      <div role="group" aria-label={t.tabsLabel} className="flex gap-2">
        <Button type="button" size="sm" variant={view === "currencies" ? "default" : "outline"} aria-pressed={view === "currencies"} onClick={() => setView("currencies")}>{t.tabs.currencies}</Button>
        <Button type="button" size="sm" variant={view === "rates" ? "default" : "outline"} aria-pressed={view === "rates"} onClick={() => setView("rates")}>{t.tabs.rates}</Button>
      </div>
      {view === "currencies" ? <CurrencyList /> : <RatesPanel />}
    </div>
  );
}

function CurrencyList(): JSX.Element {
  const { dictionary } = useI18n();
  const { currencies: t } = dictionary;
  const overlay = useOverlay();
  const query = useAdminCurrencies();
  const toggle = useSetCurrencyActive();
  const items = query.data ?? [];

  function change(currency: AdminCurrency, active: boolean): void {
    if (active) {
      toggle.mutate({ id: currency.id, active });
      return;
    }
    overlay.open({
      kind: OverlayKind.Confirm,
      title: t.confirm.retireTitle,
      description: t.confirm.retireBody,
      confirmLabel: t.confirm.retire,
      destructive: true,
      onConfirm: async () => {
        await toggle.mutateAsync({ id: currency.id, active });
      },
    });
  }

  return (
    <div className="flex flex-col gap-4">
      <div className="flex justify-end">
        <Button type="button" onClick={() => overlay.open({ kind: OverlayKind.CurrencyForm })}>
          <PlusIcon aria-hidden data-icon="inline-start" />
          {t.add}
        </Button>
      </div>
      <div aria-busy={query.isFetching} className="flex flex-col gap-4">
        {query.isPending ? <TableSkeleton /> : null}
        {query.isError ? <ErrorState title={t.states.errorTitle} body={t.states.errorBody} onRetry={() => query.refetch()} /> : null}
        {query.data && items.length === 0 ? <EmptyState title={t.states.emptyTitle} body={t.states.emptyBody} /> : null}
        {items.length > 0 ? (
          <ul aria-label={t.tabs.currencies} className="flex flex-col divide-y divide-border overflow-hidden rounded-xl border border-border bg-card">
            {items.map((currency) => (
              <CurrencyRow key={currency.id} currency={currency} busy={toggle.isPending} onEdit={(value) => overlay.open({ kind: OverlayKind.CurrencyForm, currency: value })} onToggle={change} />
            ))}
          </ul>
        ) : null}
      </div>
    </div>
  );
}
