"use client";

import { useMemo } from "react";
import type { JSX } from "react";

import { SubscriptionStatusBadge } from "@/components/subscription/subscription-status-badge";
import { Button } from "@/components/ui/button";
import { DataTable } from "@/components/ui/table/data-table";
import { SubscriptionStatus } from "@/enums/money/subscription-status.enum";
import { useI18n } from "@/hooks/core/state/use-i18n";
import type { DataTableColumn } from "@/interfaces/ui/data/data-table-column.interface";
import { localizedText } from "@/lib/core/format/booking-format.util";
import { availableSubscriptionTargets } from "@/lib/plans/subscription-transitions.util";
import type { AdminSubscription } from "@/types/plans/admin-subscription.type";
import type { SubscriptionTarget } from "@/types/plans/subscription-target.type";

interface AdminSubscriptionListProps {
  subscriptions: readonly AdminSubscription[];
  onTransition: (subscription: AdminSubscription, target: SubscriptionTarget) => void;
}

function getSubscriptionId(subscription: AdminSubscription): string {
  return subscription.id;
}

export function AdminSubscriptionList({ subscriptions, onTransition }: AdminSubscriptionListProps): JSX.Element {
  const { locale, dictionary } = useI18n();
  const { adminSubscriptions: t } = dictionary;

  const columns = useMemo<DataTableColumn<AdminSubscription>[]>(() => {
    const date = new Intl.DateTimeFormat(locale, { dateStyle: "medium" });
    const when = (iso: string): string => date.format(new Date(iso));
    return [
      { id: "brand", header: t.columns.brand, primary: true, cell: (item) => <span dir="auto" className="truncate font-medium">{localizedText(item.brand?.name, locale) || t.dates.none}</span> },
      { id: "plan", header: t.columns.plan, cell: (item) => <span dir="auto" className="truncate text-muted-foreground">{localizedText(item.plan?.name, locale) || t.dates.none}</span> },
      { id: "status", header: t.columns.status, cell: (item) => <SubscriptionStatusBadge status={item.status} /> },
      {
        id: "dates",
        header: t.columns.dates,
        cell: (item) => (
          <span className="tabular flex flex-col text-sm text-muted-foreground">
            <span>{item.starts_at ? t.dates.started.replace("{date}", when(item.starts_at)) : t.dates.none}</span>
            {item.status === SubscriptionStatus.PastDue && item.grace_ends_at ? <span className="text-xs">{t.dates.grace.replace("{date}", when(item.grace_ends_at))}</span> : null}
            {item.cancelled_at ? <span className="text-xs">{t.dates.cancelled.replace("{date}", when(item.cancelled_at))}</span> : null}
          </span>
        ),
      },
      {
        id: "actions",
        header: t.columns.actions,
        interactive: true,
        align: "end",
        cell: (item) => (
          <span className="flex flex-wrap justify-end gap-1.5">
            {availableSubscriptionTargets(item.status).map((target) => (
              <Button
                key={target}
                size="sm"
                variant={target === SubscriptionStatus.Cancelled ? "destructive" : "outline"}
                aria-label={t.rowAction.replace("{action}", t.actions[target]).replace("{brand}", localizedText(item.brand?.name, locale))}
                onClick={() => onTransition(item, target)}
              >
                {t.actions[target]}
              </Button>
            ))}
          </span>
        ),
      },
    ];
  }, [locale, onTransition, t]);

  return <DataTable caption={t.title} columns={columns} rows={subscriptions} getRowId={getSubscriptionId} />;
}
