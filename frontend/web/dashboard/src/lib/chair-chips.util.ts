import type { FilterChip } from "@/interfaces/filter-chip.interface";
import type { ChairFilters } from "@/types/chair-filters.type";
import type { Dictionary } from "@/types/dictionary.type";

export const CHAIR_CHIP_KEY = { status: "status", zone: "zone", branch: "branch", search: "search" } as const;

interface ChipInput {
  filters: ChairFilters;
  dictionary: Dictionary;
  branchLabel: (id: string) => string;
}

export function buildChairChips({ filters, dictionary, branchLabel }: ChipInput): FilterChip[] {
  const { chairs: t } = dictionary;
  const chips: FilterChip[] = [];
  if (filters.status) chips.push({ key: CHAIR_CHIP_KEY.status, label: t.filters.status, valueLabel: t.status[filters.status] });
  if (filters.floorZone) chips.push({ key: CHAIR_CHIP_KEY.zone, label: t.filters.zone, valueLabel: t.zone[filters.floorZone] });
  if (filters.branchId) chips.push({ key: CHAIR_CHIP_KEY.branch, label: t.filters.branch, valueLabel: branchLabel(filters.branchId) });
  if (filters.search) chips.push({ key: CHAIR_CHIP_KEY.search, label: t.filters.search, valueLabel: filters.search });
  return chips;
}

export function chairPatchForChip(key: string): Partial<ChairFilters> {
  switch (key) {
    case CHAIR_CHIP_KEY.status: return { status: undefined };
    case CHAIR_CHIP_KEY.zone: return { floorZone: undefined };
    case CHAIR_CHIP_KEY.branch: return { branchId: undefined };
    case CHAIR_CHIP_KEY.search: return { search: undefined };
    default: return {};
  }
}

export const CHAIR_CLEAR_ALL_PATCH: Partial<ChairFilters> = { status: undefined, floorZone: undefined, branchId: undefined, search: undefined };
