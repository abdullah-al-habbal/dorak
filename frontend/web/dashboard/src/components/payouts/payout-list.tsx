"use client";

import { useMemo } from "react";
import type { JSX } from "react";

import { PayoutStatusBadge } from "@/components/payouts/payout-status-badge";
import { DataTable } from "@/components/ui/table/data-table";
import { useI18n } from "@/hooks/core/use-i18n";
import type { DataTableColumn } from "@/interfaces/ui/data-table-column.interface";
import { formatPrice, localizedText } from "@/lib/core/booking-format.util";
import type { Payout } from "@/types/earnings/payout.type";

function getPayoutId(payout: Payout): string {
  return payout.id;
}

export function PayoutList({ payouts }: { payouts: readonly Payout[] }): JSX.Element {
  const { locale, dictionary } = useI18n();
  const { payouts: t } = dictionary;

  const columns = useMemo<DataTableColumn<Payout>[]>(() => {
    const date = new Intl.DateTimeFormat(locale, { dateStyle: "medium" });
    const day = (iso: string | null | undefined): string => (iso ? date.format(new Date(iso)) : t.notPaid);
    return [
      {
        id: "period",
        header: t.columns.period,
        primary: true,
        cell: (payout) => <span className="tabular font-medium">{t.periodRange.replace("{from}", day(payout.period_started_at)).replace("{to}", day(payout.period_ended_at))}</span>,
      },
      { id: "brand", header: t.columns.brand, cell: (payout) => <span dir="auto" className="text-muted-foreground">{localizedText(payout.brand?.name, locale) || t.notPaid}</span> },
      { id: "direction", header: t.columns.direction, cell: (payout) => <span className="text-muted-foreground">{t.direction[payout.direction_type]}</span> },
      { id: "amount", header: t.columns.amount, align: "end", cell: (payout) => <span className="tabular font-medium">{formatPrice(payout.total_amount_minor, payout.currency_code, locale)}</span> },
      { id: "status", header: t.columns.status, cell: (payout) => <PayoutStatusBadge status={payout.status} /> },
      {
        id: "paid",
        header: t.columns.paid,
        cell: (payout) => (
          <span className="tabular flex flex-col text-sm text-muted-foreground">
            <span>{day(payout.paid_at)}</span>
            {payout.external_reference ? <span dir="auto" className="text-xs">{t.reference.replace("{reference}", payout.external_reference)}</span> : null}
          </span>
        ),
      },
    ];
  }, [locale, t]);

  return <DataTable caption={t.title} columns={columns} rows={payouts} getRowId={getPayoutId} />;
}
