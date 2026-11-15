import type { FilterChip } from "@/interfaces/ui/data/filter-chip.interface";
import type { BranchFilters } from "@/types/branches/branch-filters.type";
import type { Dictionary } from "@/types/core/shared/dictionary.type";

export const BRANCH_CHIP_KEY = { status: "status", brand: "brand", search: "search" } as const;

interface ChipInput {
  filters: BranchFilters;
  dictionary: Dictionary;
  brandLabel: (id: string) => string;
}

export function buildBranchChips({ filters, dictionary, brandLabel }: ChipInput): FilterChip[] {
  const { branches: t } = dictionary;
  const chips: FilterChip[] = [];
  if (filters.status) chips.push({ key: BRANCH_CHIP_KEY.status, label: t.filters.status, valueLabel: t.status[filters.status] });
  if (filters.brandId) chips.push({ key: BRANCH_CHIP_KEY.brand, label: t.filters.brand, valueLabel: brandLabel(filters.brandId) });
  if (filters.search) chips.push({ key: BRANCH_CHIP_KEY.search, label: t.filters.search, valueLabel: filters.search });
  return chips;
}

export function branchPatchForChip(key: string): Partial<BranchFilters> {
  switch (key) {
    case BRANCH_CHIP_KEY.status: return { status: undefined };
    case BRANCH_CHIP_KEY.brand: return { brandId: undefined };
    case BRANCH_CHIP_KEY.search: return { search: undefined };
    default: return {};
  }
}

export const BRANCH_CLEAR_ALL_PATCH: Partial<BranchFilters> = { status: undefined, brandId: undefined, search: undefined };
