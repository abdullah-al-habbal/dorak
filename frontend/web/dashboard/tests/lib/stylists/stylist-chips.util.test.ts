import { describe, expect, it } from "vitest";

import { BarberStatus } from "@/enums/people/barber-status.enum";
import { buildStylistChips, STYLIST_CHIP_KEY, stylistPatchForChip } from "@/lib/stylists/stylist-chips.util";
import { enDictionary } from "@/locales/en/index.constant";

describe("stylist chips", () => {
  it("builds one chip per active filter and removes them individually", () => {
    const chips = buildStylistChips({ filters: { page: 1, status: BarberStatus.Disabled, chairId: "c1", search: "ali" }, dictionary: enDictionary, chairLabel: () => "Chair 1", branchLabel: () => "Branch 1" });
    expect(chips.map((chip) => chip.key)).toEqual([STYLIST_CHIP_KEY.status, STYLIST_CHIP_KEY.chair, STYLIST_CHIP_KEY.search]);
    expect(stylistPatchForChip(STYLIST_CHIP_KEY.chair)).toEqual({ chairId: undefined });
  });
});
