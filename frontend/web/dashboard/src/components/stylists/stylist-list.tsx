"use client";

import { useMemo } from "react";
import type { JSX } from "react";

import { StylistActiveSwitch } from "@/components/stylists/stylist-active-switch";
import { StylistStatusBadge } from "@/components/stylists/stylist-status-badge";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { DataTable } from "@/components/ui/table/data-table";
import { useI18n } from "@/hooks/core/state/use-i18n";
import type { DataTableColumn } from "@/interfaces/ui/data/data-table-column.interface";
import { localizedText } from "@/lib/core/format/booking-format.util";
import { initialsOf } from "@/lib/core/format/initials.util";
import type { Stylist } from "@/types/stylists/stylist.type";

interface StylistListProps {
  stylists: readonly Stylist[];
  togglingId: string | null;
  onSelect: (stylist: Stylist) => void;
  onToggle: (stylist: Stylist, active: boolean) => void;
  /** The platform admin only reads a branch's staff. */
  readOnly?: boolean;
}

const DASH = "-";

function getStylistId(stylist: Stylist): string {
  return stylist.id;
}

export function StylistList({ stylists, togglingId, onSelect, onToggle, readOnly = false }: StylistListProps): JSX.Element {
  const { locale, dictionary } = useI18n();
  const { stylists: t } = dictionary;

  const columns = useMemo<DataTableColumn<Stylist>[]>(
    () => [
      {
        id: "name",
        header: t.columns.name,
        primary: true,
        cell: (stylist) => {
          const name = localizedText(stylist.name, locale);
          return (
            <span className="flex min-w-0 items-center gap-3">
              <Avatar size="lg"><AvatarFallback>{initialsOf(name)}</AvatarFallback></Avatar>
              <span className="flex min-w-0 flex-col">
                <span dir="auto" className="truncate font-medium">{name}</span>
                <span dir="ltr" className="truncate text-start text-xs text-muted-foreground">{stylist.email || DASH}</span>
              </span>
            </span>
          );
        },
      },
      { id: "phone", header: t.columns.phone, cell: (stylist) => <span dir="ltr" className="tabular text-muted-foreground">{stylist.phone || DASH}</span> },
      { id: "chair", header: t.columns.chair, cell: (stylist) => <span className="text-muted-foreground">{localizedText(stylist.chair?.label, locale) || t.noChair}</span> },
      { id: "status", header: t.columns.status, cell: (stylist) => <StylistStatusBadge status={stylist.status} /> },
      {
        id: "active",
        header: t.columns.active,
        interactive: true,
        align: "end",
        cell: (stylist) => <StylistActiveSwitch stylist={stylist} disabled={readOnly || togglingId === stylist.id} onToggle={onToggle} />,
      },
    ],
    [locale, onToggle, t, readOnly, togglingId],
  );

  return <DataTable caption={t.title} columns={columns} rows={stylists} getRowId={getStylistId} onRowSelect={readOnly ? undefined : onSelect} rowLabel={(stylist) => localizedText(stylist.name, locale)} />;
}
