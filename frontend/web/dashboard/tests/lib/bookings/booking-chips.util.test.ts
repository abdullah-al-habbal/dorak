import { describe, expect, it } from "vitest";

import { BookingStatus } from "@/enums/booking/booking-status.enum";
import { BookingView } from "@/enums/booking/booking-view.enum";
import { buildBookingChips, CHIP_KEY, CLEAR_ALL_PATCH, patchForChip } from "@/lib/bookings/booking-chips.util";
import { enDictionary } from "@/locales/en/index.constant";
import type { Dictionary } from "@/types/core/shared/dictionary.type";

const BASE = { view: BookingView.List, date: "2026-11-04", page: 1 };
const dictionary: Dictionary = enDictionary;

describe("booking chips", () => {
  it("builds one chip per active filter", () => {
    const chips = buildBookingChips({
      filters: { ...BASE, status: BookingStatus.Confirmed, chairId: "c1", search: "ali", hideCancelled: true },
      dictionary,
      chairLabel: () => "Chair 1",
    });
    expect(chips.map((chip) => chip.key)).toEqual([CHIP_KEY.status, CHIP_KEY.chair, CHIP_KEY.search, CHIP_KEY.hideCancelled]);
    expect(chips[1].valueLabel).toBe("Chair 1");
  });

  it("has no chips without filters", () => {
    expect(buildBookingChips({ filters: BASE, dictionary, chairLabel: (id) => id })).toEqual([]);
  });

  it("removes a single filter and clears all", () => {
    expect(patchForChip(CHIP_KEY.chair)).toEqual({ chairId: undefined });
    expect(patchForChip("unknown")).toEqual({});
    expect(Object.keys(CLEAR_ALL_PATCH)).toHaveLength(4);
  });
});
