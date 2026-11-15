import type { FilterChip } from "@/interfaces/ui/filter-chip.interface";
import type { StylistFilters } from "@/types/stylists/stylist-filters.type";
import type { Dictionary } from "@/types/core/dictionary.type";

export const STYLIST_CHIP_KEY = { status: "status", chair: "chair", branch: "branch", search: "search" } as const;

interface ChipInput {
  filters: StylistFilters;
  dictionary: Dictionary;
  chairLabel: (id: string) => string;
  branchLabel: (id: string) => string;
}

export function buildStylistChips({ filters, dictionary, chairLabel, branchLabel }: ChipInput): FilterChip[] {
  const { stylists: t } = dictionary;
  const chips: FilterChip[] = [];
  if (filters.status) chips.push({ key: STYLIST_CHIP_KEY.status, label: t.filters.status, valueLabel: t.status[filters.status] });
  if (filters.chairId) chips.push({ key: STYLIST_CHIP_KEY.chair, label: t.filters.chair, valueLabel: chairLabel(filters.chairId) });
  if (filters.branchId) chips.push({ key: STYLIST_CHIP_KEY.branch, label: t.filters.branch, valueLabel: branchLabel(filters.branchId) });
  if (filters.search) chips.push({ key: STYLIST_CHIP_KEY.search, label: t.filters.search, valueLabel: filters.search });
  return chips;
}

export function stylistPatchForChip(key: string): Partial<StylistFilters> {
  switch (key) {
    case STYLIST_CHIP_KEY.status: return { status: undefined };
    case STYLIST_CHIP_KEY.chair: return { chairId: undefined };
    case STYLIST_CHIP_KEY.branch: return { branchId: undefined };
    case STYLIST_CHIP_KEY.search: return { search: undefined };
    default: return {};
  }
}

export const STYLIST_CLEAR_ALL_PATCH: Partial<StylistFilters> = { status: undefined, chairId: undefined, branchId: undefined, search: undefined };
