"use client";

import { PlusIcon } from "lucide-react";
import type { JSX } from "react";

import { SearchInput } from "@/components/common/search-input";
import { Button } from "@/components/ui/button";
import { NativeSelect } from "@/components/ui/native-select";
import { BarberStatus } from "@/enums/barber-status.enum";
import { useI18n } from "@/hooks/core/use-i18n";
import { localizedText } from "@/lib/core/booking-format.util";
import type { BranchOption } from "@/types/branches/branch-option.type";
import type { ChairOption } from "@/types/chairs/chair-option.type";
import type { StylistFilters } from "@/types/stylists/stylist-filters.type";

interface StylistToolbarProps {
  filters: StylistFilters;
  chairs: readonly ChairOption[];
  /** More than one entry shows the branch filter. */
  branches: readonly BranchOption[];
  onChange: (patch: Partial<StylistFilters>) => void;
  /** Omitted for the platform admin, who only reads stylists. */
  onNew?: () => void;
}

const STATUSES = new Set<string>(Object.values(BarberStatus));

function parseStatus(value: string): BarberStatus | undefined {
  return STATUSES.has(value) ? (value as BarberStatus) : undefined;
}

export function StylistToolbar({ filters, chairs, branches, onChange, onNew }: StylistToolbarProps): JSX.Element {
  const { locale, dictionary } = useI18n();
  const { stylists: t } = dictionary;

  return (
    <div role="group" aria-label={t.filters.toolbar} className="flex flex-wrap items-center gap-2">
      <SearchInput value={filters.search} label={t.filters.search} onCommit={(search) => onChange({ search })} />
      <label className="w-full sm:w-44">
        <span className="sr-only">{t.filters.status}</span>
        <NativeSelect value={filters.status ?? ""} onChange={(event) => onChange({ status: parseStatus(event.target.value) })}>
          <option value="">{t.filters.allStatuses}</option>
          {Object.values(BarberStatus).map((status) => (
            <option key={status} value={status}>{t.status[status]}</option>
          ))}
        </NativeSelect>
      </label>
      <label className="w-full sm:w-44">
        <span className="sr-only">{t.filters.chair}</span>
        <NativeSelect value={filters.chairId ?? ""} onChange={(event) => onChange({ chairId: event.target.value || undefined })}>
          <option value="">{t.filters.allChairs}</option>
          {chairs.map((chair) => (
            <option key={chair.id} value={chair.id}>{localizedText(chair.label, locale) || chair.id}</option>
          ))}
        </NativeSelect>
      </label>
      {branches.length > 1 ? (
        <label className="w-full sm:w-44">
          <span className="sr-only">{t.filters.branch}</span>
          <NativeSelect value={filters.branchId ?? ""} onChange={(event) => onChange({ branchId: event.target.value || undefined })}>
            <option value="">{t.filters.allBranches}</option>
            {branches.map((branch) => (
              <option key={branch.id} value={branch.id}>{branch.name}</option>
            ))}
          </NativeSelect>
        </label>
      ) : null}
      {onNew ? (
        <Button className="ms-auto" onClick={onNew}>
          <PlusIcon aria-hidden data-icon="inline-start" />
          {t.newStylist}
        </Button>
      ) : null}
    </div>
  );
}
