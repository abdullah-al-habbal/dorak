"use client";

import { useMemo } from "react";
import type { JSX } from "react";

import { ChairServiceSwitch } from "@/components/chairs/chair-service-switch";
import { ChairStatusBadge } from "@/components/chairs/chair-status-badge";
import { DataTable } from "@/components/ui/table/data-table";
import { ChairStatus } from "@/enums/chair-status.enum";
import { useI18n } from "@/hooks/core/use-i18n";
import type { DataTableColumn } from "@/interfaces/ui/data-table-column.interface";
import { localizedText } from "@/lib/booking-format.util";
import type { Chair } from "@/types/chairs/chair.type";

interface ChairListProps {
  chairs: readonly Chair[];
  togglingId: string | null;
  onSelect: (chair: Chair) => void;
  onToggle: (chair: Chair, inService: boolean) => void;
  /** The platform admin only reads a branch's chairs. */
  readOnly?: boolean;
}

function getChairId(chair: Chair): string {
  return chair.id;
}

export function ChairList({ chairs, togglingId, onSelect, onToggle, readOnly = false }: ChairListProps): JSX.Element {
  const { locale, dictionary } = useI18n();
  const { chairs: t } = dictionary;

  const columns = useMemo<DataTableColumn<Chair>[]>(
    () => [
      { id: "label", header: t.columns.label, primary: true, cell: (chair) => <span dir="auto" className="truncate font-medium">{chair.label}</span> },
      { id: "zone", header: t.columns.zone, cell: (chair) => <span className="text-muted-foreground">{chair.floor_zone ? t.zone[chair.floor_zone] : t.none}</span> },
      { id: "stylist", header: t.columns.stylist, cell: (chair) => <span dir="auto" className="text-muted-foreground">{localizedText(chair.barber?.name, locale) || t.noStylist}</span> },
      { id: "status", header: t.columns.status, cell: (chair) => <ChairStatusBadge status={chair.status ?? chair.configured_status ?? ChairStatus.Available} /> },
      {
        id: "service",
        header: t.columns.inService,
        interactive: true,
        align: "end",
        cell: (chair) => <ChairServiceSwitch chair={chair} disabled={readOnly || togglingId === chair.id} onToggle={onToggle} />,
      },
    ],
    [locale, onToggle, readOnly, t, togglingId],
  );

  return <DataTable caption={t.title} columns={columns} rows={chairs} getRowId={getChairId} onRowSelect={readOnly ? undefined : onSelect} rowLabel={(chair) => chair.label ?? ""} />;
}
