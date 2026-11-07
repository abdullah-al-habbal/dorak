"use client";

import { useMemo } from "react";
import type { JSX } from "react";

import { PayoutStatusBadge } from "@/components/payouts/payout-status-badge";
import { Button } from "@/components/ui/button";
import { DataTable } from "@/components/ui/table/data-table";
import { PayoutAction } from "@/enums/payout-action.enum";
import { useI18n } from "@/hooks/use-i18n";
import type { DataTableColumn } from "@/interfaces/data-table-column.interface";
import { formatPrice, localizedText } from "@/lib/booking-format.util";
import { availablePayoutActions } from "@/lib/payout-actions.util";
import type { AdminPayout } from "@/types/admin-payout.type";

interface AdminPayoutListProps {
  payouts: readonly AdminPayout[];
  onAction: (payout: AdminPayout, action: PayoutAction) => void;
}

function getPayoutId(payout: AdminPayout): string {
  return payout.id;
}

export function AdminPayoutList({ payouts, onAction }: AdminPayoutListProps): JSX.Element {
  const { locale, dictionary } = useI18n();
  const { adminPayouts: t, payouts: shared } = dictionary;

  const columns = useMemo<DataTableColumn<AdminPayout>[]>(() => {
    const date = new Intl.DateTimeFormat(locale, { dateStyle: "medium" });
    const day = (iso: string | null | undefined): string => (iso ? date.format(new Date(iso)) : shared.notPaid);
    const period = (payout: AdminPayout): string => shared.periodRange.replace("{from}", day(payout.period_started_at)).replace("{to}", day(payout.period_ended_at));
    return [
      { id: "period", header: t.columns.period, primary: true, cell: (payout) => <span className="tabular font-medium">{period(payout)}</span> },
      { id: "brand", header: t.columns.brand, cell: (payout) => <span dir="auto" className="text-muted-foreground">{localizedText(payout.brand?.name, locale) || shared.notPaid}</span> },
      { id: "amount", header: t.columns.amount, align: "end", cell: (payout) => <span className="tabular font-medium">{formatPrice(payout.total_amount_minor, payout.currency?.code, locale)}</span> },
      { id: "status", header: t.columns.status, cell: (payout) => <PayoutStatusBadge status={payout.status} /> },
      {
        id: "payment",
        header: t.columns.payment,
        cell: (payout) => (
          <span className="tabular flex flex-col text-sm text-muted-foreground">
            <span>{day(payout.paid_at)}</span>
            {payout.external_reference ? <span dir="auto" className="text-xs">{shared.reference.replace("{reference}", payout.external_reference)}</span> : null}
          </span>
        ),
      },
      {
        id: "actions",
        header: t.columns.actions,
        interactive: true,
        align: "end",
        cell: (payout) => (
          <span className="flex flex-wrap justify-end gap-1.5">
            {availablePayoutActions(payout.status).map((action) => (
              <Button
                key={action}
                size="sm"
                variant={action === PayoutAction.Cancel ? "destructive" : "outline"}
                aria-label={t.rowAction.replace("{action}", t.actions[action]).replace("{brand}", localizedText(payout.brand?.name, locale)).replace("{period}", period(payout))}
                onClick={() => onAction(payout, action)}
              >
                {t.actions[action]}
              </Button>
            ))}
          </span>
        ),
      },
    ];
  }, [locale, onAction, shared, t]);

  return <DataTable caption={t.title} columns={columns} rows={payouts} getRowId={getPayoutId} />;
}
