"use client";

import { BanIcon, ShieldOffIcon } from "lucide-react";
import { useMemo } from "react";
import type { JSX } from "react";

import { ClientStatusBadge } from "@/components/clients/client-status-badge";
import { Button } from "@/components/ui/button";
import { DataTable } from "@/components/ui/table/data-table";
import { useI18n } from "@/hooks/use-i18n";
import type { DataTableColumn } from "@/interfaces/data-table-column.interface";
import { localizedText } from "@/lib/booking-format.util";
import type { AdminClient } from "@/types/admin-client.type";

interface ClientListProps {
  clients: readonly AdminClient[];
  onSelect: (client: AdminClient) => void;
  onBan: (client: AdminClient) => void;
  onUnban: (client: AdminClient) => void;
}

function getClientId(client: AdminClient): string {
  return client.id;
}

export function ClientList({ clients, onSelect, onBan, onUnban }: ClientListProps): JSX.Element {
  const { locale, dictionary } = useI18n();
  const { clients: t } = dictionary;

  const columns = useMemo<DataTableColumn<AdminClient>[]>(() => {
    const date = new Intl.DateTimeFormat(locale, { dateStyle: "medium" });
    return [
      { id: "client", header: t.columns.client, primary: true, cell: (client) => <span dir="auto" className="truncate font-medium">{localizedText(client.name, locale) || t.none}</span> },
      { id: "email", header: t.columns.email, cell: (client) => <span dir="ltr" translate="no" className="truncate text-muted-foreground">{client.email ?? t.none}</span> },
      { id: "phone", header: t.columns.phone, cell: (client) => <span dir="ltr" translate="no" className="tabular text-muted-foreground">{client.phone ?? t.none}</span> },
      { id: "bookings", header: t.columns.bookings, cell: (client) => <span className="tabular">{client.bookings_count ?? t.none}</span> },
      { id: "status", header: t.columns.status, cell: (client) => <ClientStatusBadge status={client.status} banned={client.is_banned} /> },
      { id: "created", header: t.columns.created, cell: (client) => <span className="tabular text-sm text-muted-foreground">{client.created_at ? date.format(new Date(client.created_at)) : t.none}</span> },
      {
        id: "actions",
        header: t.columns.actions,
        interactive: true,
        align: "end",
        cell: (client) => {
          const name = localizedText(client.name, locale);
          return client.is_banned ? (
            <Button size="sm" variant="outline" aria-label={t.rowUnban.replace("{client}", name)} onClick={() => onUnban(client)}>
              <ShieldOffIcon aria-hidden data-icon="inline-start" />
              {t.unban.action}
            </Button>
          ) : (
            <Button size="sm" variant="outline" aria-label={t.rowBan.replace("{client}", name)} onClick={() => onBan(client)}>
              <BanIcon aria-hidden data-icon="inline-start" />
              {t.ban.action}
            </Button>
          );
        },
      },
    ];
  }, [locale, onBan, onUnban, t]);

  return <DataTable caption={t.title} columns={columns} rows={clients} getRowId={getClientId} onRowSelect={onSelect} rowLabel={(client) => t.rowLabel.replace("{client}", localizedText(client.name, locale))} />;
}
