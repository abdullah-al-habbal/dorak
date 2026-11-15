"use client";

import { CheckIcon, XIcon } from "lucide-react";
import { useMemo } from "react";
import type { JSX } from "react";

import { BarberStatusBadge } from "@/components/barber-approvals/barber-status-badge";
import { Button } from "@/components/ui/button";
import { DataTable } from "@/components/ui/table/data-table";
import { BarberStatus } from "@/enums/people/barber-status.enum";
import { useI18n } from "@/hooks/core/state/use-i18n";
import type { DataTableColumn } from "@/interfaces/ui/data/data-table-column.interface";
import { localizedText } from "@/lib/core/format/booking-format.util";
import type { BarberApproval } from "@/types/stylists/barber-approval.type";

interface BarberApprovalListProps {
  barbers: readonly BarberApproval[];
  onSelect: (barber: BarberApproval) => void;
  onApprove: (barber: BarberApproval) => void;
  onReject: (barber: BarberApproval) => void;
}

function getBarberId(barber: BarberApproval): string {
  return barber.id;
}

export function BarberApprovalList({ barbers, onSelect, onApprove, onReject }: BarberApprovalListProps): JSX.Element {
  const { locale, dictionary } = useI18n();
  const { barberApprovals: t } = dictionary;
  const rowLabel = (barber: BarberApproval) => t.rowLabel.replace("{barber}", localizedText(barber.name, locale));

  const columns = useMemo<DataTableColumn<BarberApproval>[]>(() => {
    const date = new Intl.DateTimeFormat(locale, { dateStyle: "medium" });
    return [
      { id: "barber", header: t.columns.barber, primary: true, cell: (barber) => <span dir="auto" className="truncate font-medium">{localizedText(barber.name, locale) || t.none}</span> },
      { id: "email", header: t.columns.email, cell: (barber) => <span dir="ltr" translate="no" className="truncate text-muted-foreground">{barber.email ?? t.none}</span> },
      { id: "submissions", header: t.columns.submissions, cell: (barber) => <span className="tabular">{barber.submission_count ?? t.none}</span> },
      { id: "status", header: t.columns.status, cell: (barber) => <BarberStatusBadge status={barber.status} banned={barber.is_banned === true} /> },
      { id: "created", header: t.columns.created, cell: (barber) => <span className="tabular text-sm text-muted-foreground">{date.format(new Date(barber.created_at))}</span> },
      {
        id: "actions",
        header: t.columns.actions,
        interactive: true,
        align: "end",
        cell: (barber) =>
          barber.status === BarberStatus.Pending ? (
            <div className="flex justify-end gap-2">
              <Button size="sm" aria-label={t.rowApprove.replace("{barber}", localizedText(barber.name, locale))} onClick={() => onApprove(barber)}>
                <CheckIcon aria-hidden data-icon="inline-start" />
                {t.approve}
              </Button>
              <Button size="sm" variant="outline" aria-label={t.rowReject.replace("{barber}", localizedText(barber.name, locale))} onClick={() => onReject(barber)}>
                <XIcon aria-hidden data-icon="inline-start" />
                {t.reject}
              </Button>
            </div>
          ) : null,
      },
    ];
  }, [locale, onApprove, onReject, t]);

  return <DataTable caption={t.title} columns={columns} rows={barbers} getRowId={getBarberId} onRowSelect={onSelect} rowLabel={rowLabel} />;
}
