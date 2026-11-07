"use client";

import { useMemo } from "react";
import type { JSX } from "react";

import { PlanStateBadge } from "@/components/plans/plan-state-badge";
import { DataTable } from "@/components/ui/table/data-table";
import { useI18n } from "@/hooks/use-i18n";
import type { DataTableColumn } from "@/interfaces/data-table-column.interface";
import { formatPrice, localizedText } from "@/lib/booking-format.util";
import { featureLabel, intervalLabel } from "@/lib/subscription-format.util";
import type { Plan } from "@/types/plan.type";

interface PlanListProps {
  plans: readonly Plan[];
  onSelect: (plan: Plan) => void;
}

function getPlanId(plan: Plan): string {
  return plan.id;
}

export function PlanList({ plans, onSelect }: PlanListProps): JSX.Element {
  const { locale, dictionary } = useI18n();
  const { plans: t, subscription } = dictionary;

  const columns = useMemo<DataTableColumn<Plan>[]>(
    () => [
      { id: "name", header: t.columns.name, primary: true, cell: (plan) => <span dir="auto" className="truncate font-medium">{localizedText(plan.name, locale)}</span> },
      {
        id: "price",
        header: t.columns.price,
        cell: (plan) => (
          <span className="tabular">
            {t.price
              .replace("{price}", formatPrice(plan.price_amount_minor, plan.currency?.code, locale))
              .replace("{interval}", intervalLabel(plan.interval_unit, plan.interval_count, subscription.interval))}
          </span>
        ),
      },
      {
        id: "features",
        header: t.columns.features,
        cell: (plan) => (
          <span className="text-muted-foreground">
            {plan.feature_keys.length === 0 ? t.noFeatures : plan.feature_keys.map((key) => featureLabel(key, subscription.features.labels)).join(", ")}
          </span>
        ),
      },
      { id: "order", header: t.columns.order, align: "end", cell: (plan) => <span className="tabular text-muted-foreground">{plan.sort_order}</span> },
      { id: "status", header: t.columns.status, cell: (plan) => <PlanStateBadge active={plan.is_active} /> },
    ],
    [locale, subscription, t],
  );

  return <DataTable caption={t.title} columns={columns} rows={plans} getRowId={getPlanId} onRowSelect={onSelect} rowLabel={(plan) => localizedText(plan.name, locale)} />;
}
