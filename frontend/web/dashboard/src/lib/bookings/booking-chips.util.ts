import type { FilterChip } from "@/interfaces/ui/data/filter-chip.interface";
import type { BookingFilters } from "@/types/bookings/booking-filters.type";
import type { Dictionary } from "@/types/core/shared/dictionary.type";

export const CHIP_KEY = { status: "status", chair: "chair", search: "search", hideCancelled: "hideCancelled" } as const;

interface ChipInput {
  filters: BookingFilters;
  dictionary: Dictionary;
  /** Resolves a chair id to its label; falls back to the id while chairs load. */
  chairLabel: (id: string) => string;
}

export function buildBookingChips({ filters, dictionary, chairLabel }: ChipInput): FilterChip[] {
  const { bookings: t, common } = dictionary;
  const chips: FilterChip[] = [];
  if (filters.status) chips.push({ key: CHIP_KEY.status, label: t.filters.status, valueLabel: t.status[filters.status] });
  if (filters.chairId) chips.push({ key: CHIP_KEY.chair, label: t.filters.chair, valueLabel: chairLabel(filters.chairId) });
  if (filters.search) chips.push({ key: CHIP_KEY.search, label: t.columns.client, valueLabel: filters.search });
  if (filters.hideCancelled) chips.push({ key: CHIP_KEY.hideCancelled, label: t.filters.hideCancelled, valueLabel: common.filters.on });
  return chips;
}

/** The filter patch that removes one chip. */
export function patchForChip(key: string): Partial<BookingFilters> {
  switch (key) {
    case CHIP_KEY.status: return { status: undefined };
    case CHIP_KEY.chair: return { chairId: undefined };
    case CHIP_KEY.search: return { search: undefined };
    case CHIP_KEY.hideCancelled: return { hideCancelled: undefined };
    default: return {};
  }
}

export const CLEAR_ALL_PATCH: Partial<BookingFilters> = { status: undefined, chairId: undefined, search: undefined, hideCancelled: undefined };
