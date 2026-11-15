"use client";

import { PlusIcon } from "lucide-react";
import type { JSX } from "react";

import { SearchInput } from "@/components/common/search-input";
import { Button } from "@/components/ui/button";
import { NativeSelect } from "@/components/ui/native-select";
import { ChairStatus } from "@/enums/chair-status.enum";
import { FloorZone } from "@/enums/floor-zone.enum";
import { useI18n } from "@/hooks/core/use-i18n";
import type { ChairFilters } from "@/types/chairs/chair-filters.type";
import type { BranchOption } from "@/types/branches/branch-option.type";

interface ChairToolbarProps {
  filters: ChairFilters;
  /** More than one entry shows the branch filter. */
  branches: readonly BranchOption[];
  onChange: (patch: Partial<ChairFilters>) => void;
  /** Omitted for the platform admin, who only reads chairs. */
  onNew?: () => void;
}

const STATUSES = new Set<string>(Object.values(ChairStatus));
const ZONES = new Set<string>(Object.values(FloorZone));

export function ChairToolbar({ filters, branches, onChange, onNew }: ChairToolbarProps): JSX.Element {
  const { dictionary } = useI18n();
  const { chairs: t } = dictionary;

  return (
    <div role="group" aria-label={t.filters.toolbar} className="flex flex-wrap items-center gap-2">
      <SearchInput value={filters.search} label={t.filters.search} onCommit={(search) => onChange({ search })} />
      <label className="w-full sm:w-44">
        <span className="sr-only">{t.filters.status}</span>
        <NativeSelect value={filters.status ?? ""} onChange={(event) => onChange({ status: STATUSES.has(event.target.value) ? (event.target.value as ChairStatus) : undefined })}>
          <option value="">{t.filters.allStatuses}</option>
          {Object.values(ChairStatus).map((status) => (
            <option key={status} value={status}>{t.status[status]}</option>
          ))}
        </NativeSelect>
      </label>
      <label className="w-full sm:w-44">
        <span className="sr-only">{t.filters.zone}</span>
        <NativeSelect value={filters.floorZone ?? ""} onChange={(event) => onChange({ floorZone: ZONES.has(event.target.value) ? (event.target.value as FloorZone) : undefined })}>
          <option value="">{t.filters.allZones}</option>
          {Object.values(FloorZone).map((zone) => (
            <option key={zone} value={zone}>{t.zone[zone]}</option>
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
          {t.newChair}
        </Button>
      ) : null}
    </div>
  );
}
