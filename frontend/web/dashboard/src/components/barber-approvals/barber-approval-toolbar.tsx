"use client";

import type { JSX } from "react";

import { SearchInput } from "@/components/common/search-input";
import { NativeSelect } from "@/components/ui/native-select";
import { BARBER_STATUS_FILTER_ALL } from "@/config/barber-approval.constant";
import { BarberStatus } from "@/enums/barber-status.enum";
import { useDictionary } from "@/hooks/use-dictionary";
import type { BarberApprovalFilters } from "@/types/stylists/barber-approval-filters.type";

interface BarberApprovalToolbarProps {
  filters: BarberApprovalFilters;
  onChange: (patch: Partial<BarberApprovalFilters>) => void;
}

function toStatusFilter(value: string): BarberApprovalFilters["status"] {
  return Object.values(BarberStatus).find((status) => status === value) ?? BARBER_STATUS_FILTER_ALL;
}

export function BarberApprovalToolbar({ filters, onChange }: BarberApprovalToolbarProps): JSX.Element {
  const { barberApprovals: t } = useDictionary();
  return (
    <div role="group" aria-label={t.filters.toolbar} className="flex flex-wrap items-center gap-2">
      <SearchInput value={filters.search} label={t.filters.search} onCommit={(search) => onChange({ search })} />
      <label className="w-full sm:w-52">
        <span className="sr-only">{t.filters.status}</span>
        <NativeSelect value={filters.status} onChange={(event) => onChange({ status: toStatusFilter(event.target.value) })}>
          {Object.values(BarberStatus).map((status) => (
            <option key={status} value={status}>{t.status[status]}</option>
          ))}
          <option value={BARBER_STATUS_FILTER_ALL}>{t.filters.allStatuses}</option>
        </NativeSelect>
      </label>
    </div>
  );
}
