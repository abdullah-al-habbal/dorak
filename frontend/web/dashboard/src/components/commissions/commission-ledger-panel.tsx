"use client";

import { useState } from "react";
import type { JSX } from "react";

import { EmptyState } from "@/components/common/empty-state";
import { ErrorState } from "@/components/common/error-state";
import { FormField } from "@/components/common/form-field";
import { Badge } from "@/components/ui/badge";
import { NativeSelect } from "@/components/ui/native-select";
import { PaginationBar } from "@/components/ui/table/pagination-bar";
import { TableSkeleton } from "@/components/ui/table/table-skeleton";
import { ALL_BRANDS, SETTLED_ALL, SETTLED_FILTERS } from "@/config/commission.constant";
import { useBrandOptions } from "@/hooks/brands/use-brand-options";
import { useCommissionEntries } from "@/hooks/earnings/use-commissions";
import { useI18n } from "@/hooks/core/use-i18n";
import { localizedText } from "@/lib/core/booking-format.util";
import { money, totalsByCurrency } from "@/lib/earnings/commission.util";

const FIRST_PAGE = 1;

/** The commission charged on each completed booking. Amounts stay in their own currency and are totalled per currency only. */
export function CommissionLedgerPanel(): JSX.Element {
  const { dictionary, locale } = useI18n();
  const t = dictionary.commissions;
  const brands = useBrandOptions();
  const [brandId, setBrandId] = useState(ALL_BRANDS);
  const [settled, setSettled] = useState<string>(SETTLED_ALL);
  const [page, setPage] = useState(FIRST_PAGE);
  const query = useCommissionEntries(brandId, settled, page);
  const items = query.data?.items ?? [];
  const totals = totalsByCurrency(items);
  const brandName = (id: string | null | undefined) => localizedText(brands.data?.find((brand) => brand.id === id)?.name, locale) || t.unknownBrand;

  return (
    <div className="flex flex-col gap-4">
      <div className="flex flex-wrap items-end gap-3">
        <FormField id="ledger-brand" label={t.ledger.brand}>
          <NativeSelect id="ledger-brand" value={brandId} onChange={(event) => { setBrandId(event.target.value); setPage(FIRST_PAGE); }}>
            <option value={ALL_BRANDS}>{t.ledger.allBrands}</option>
            {brands.data?.map((brand) => (
              <option key={brand.id} value={brand.id}>{localizedText(brand.name, locale)}</option>
            ))}
          </NativeSelect>
        </FormField>
        <FormField id="ledger-settled" label={t.ledger.settlement}>
          <NativeSelect id="ledger-settled" value={settled} onChange={(event) => { setSettled(event.target.value); setPage(FIRST_PAGE); }}>
            {SETTLED_FILTERS.map((value) => (
              <option key={value} value={value}>{t.ledger.settledFilter[value]}</option>
            ))}
          </NativeSelect>
        </FormField>
      </div>
      <div aria-busy={query.isFetching} className="flex flex-col gap-4">
        {query.isPending ? <TableSkeleton /> : null}
        {query.isError ? <ErrorState title={t.states.errorTitle} body={t.states.errorBody} onRetry={() => query.refetch()} /> : null}
        {query.data && items.length === 0 ? <EmptyState title={t.states.noEntriesTitle} body={t.states.noEntriesBody} /> : null}
        {items.length > 0 ? (
          <>
            <ul aria-label={t.tabs.ledger} className="flex flex-col divide-y divide-border overflow-hidden rounded-xl border border-border bg-card">
              {items.map((entry) => {
                const code = entry.currency?.code ?? "";
                return (
                  <li key={entry.id} className="flex flex-wrap items-center justify-between gap-3 p-4">
                    <div className="flex min-w-0 flex-col gap-1">
                      <span dir="auto" className="truncate font-medium">{brandName(entry.brand_id)}</span>
                      <span className="flex flex-wrap items-center gap-x-3 gap-y-1 text-sm text-muted-foreground">
                        <span className="tabular">{t.ledger.base.replace("{amount}", money(entry.base_amount_minor, code, locale))}</span>
                        <time dateTime={entry.created_at} className="tabular">{new Intl.DateTimeFormat(locale, { dateStyle: "medium" }).format(new Date(entry.created_at))}</time>
                      </span>
                    </div>
                    <div className="flex items-center gap-3">
                      <span className="tabular font-medium">{money(entry.commission_amount_minor, code, locale)}</span>
                      <Badge variant={entry.payout_id ? "success" : "warning"}>{entry.payout_id ? t.ledger.settled : t.ledger.unsettled}</Badge>
                    </div>
                  </li>
                );
              })}
            </ul>
            <section aria-label={t.ledger.pageTotals} className="rounded-xl border border-border bg-card p-4">
              <h2 className="mb-2 text-sm font-medium">{t.ledger.pageTotals}</h2>
              <ul className="flex flex-col gap-1 text-sm">
                {totals.map((total) => (
                  <li key={total.code} className="tabular flex flex-wrap justify-between gap-3">
                    <span dir="ltr">{total.code || t.ledger.noCurrency}</span>
                    <span>{`${money(total.commission, total.code, locale)} / ${money(total.base, total.code, locale)}`}</span>
                  </li>
                ))}
              </ul>
            </section>
            {query.data ? <PaginationBar page={query.data.page.current_page} totalPages={query.data.page.total_pages} label={t.tabs.ledger} onPageChange={setPage} /> : null}
          </>
        ) : null}
      </div>
    </div>
  );
}
