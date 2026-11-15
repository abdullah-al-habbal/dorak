"use client";

import { useMemo } from "react";
import type { JSX } from "react";

import { ServiceActiveSwitch } from "@/components/services/service-active-switch";
import { Badge } from "@/components/ui/badge";
import { DataTable } from "@/components/ui/table/data-table";
import { useI18n } from "@/hooks/core/use-i18n";
import type { DataTableColumn } from "@/interfaces/ui/data-table-column.interface";
import type { ServiceGroup } from "@/interfaces/services/service-group.interface";
import { localizedText } from "@/lib/booking-format.util";
import { formatDuration, formatServicePrice } from "@/lib/service-format.util";
import type { Service } from "@/types/services/service.type";

interface ServiceGroupSectionProps {
  group: ServiceGroup;
  togglingId: string | null;
  onSelect: (service: Service) => void;
  onToggle: (service: Service, active: boolean) => void;
  /** The platform admin only reads a brand's services. */
  readOnly?: boolean;
}

function getServiceId(service: Service): string {
  return service.id;
}

export function ServiceGroupSection({ group, togglingId, onSelect, onToggle, readOnly = false }: ServiceGroupSectionProps): JSX.Element {
  const { locale, dictionary } = useI18n();
  const { services: t } = dictionary;
  const heading = group.label ?? t.uncategorised;

  const columns = useMemo<DataTableColumn<Service>[]>(
    () => [
      { id: "name", header: t.columns.name, primary: true, cell: (service) => <span dir="auto" className="font-medium">{localizedText(service.name, locale)}</span> },
      { id: "price", header: t.columns.price, align: "end", cell: (service) => <span className="tabular">{formatServicePrice(service.price_amount_minor, service.currency_code, locale, dictionary)}</span> },
      { id: "duration", header: t.columns.duration, cell: (service) => <span className="tabular text-muted-foreground">{service.duration_minutes ? formatDuration(service.duration_minutes, dictionary) : t.noDuration}</span> },
      { id: "flags", header: t.columns.flags, cell: (service) => (service.is_at_home ? <Badge variant="outline">{t.atHome}</Badge> : <span className="text-muted-foreground">-</span>) },
      {
        id: "active",
        header: t.columns.active,
        interactive: true,
        align: "end",
        cell: (service) => <ServiceActiveSwitch service={service} disabled={readOnly || togglingId === service.id} onToggle={onToggle} />,
      },
    ],
    [dictionary, locale, onToggle, readOnly, t, togglingId],
  );

  return (
    <section aria-label={heading} className="flex flex-col gap-2">
      <h2 className="font-heading text-lg font-semibold">{heading}</h2>
      <DataTable caption={heading} columns={columns} rows={group.services} getRowId={getServiceId} onRowSelect={readOnly ? undefined : onSelect} rowLabel={(service) => localizedText(service.name, locale)} />
    </section>
  );
}
