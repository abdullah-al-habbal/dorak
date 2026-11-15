import { describe, expect, it } from "vitest";

import { ChairStatus } from "@/enums/chair-status.enum";
import { FloorZone } from "@/enums/floor-zone.enum";
import { buildChairChips, CHAIR_CHIP_KEY, chairPatchForChip } from "@/lib/chair-chips.util";
import { enDictionary } from "@/locales/en/index.constant";

describe("chair chips", () => {
  it("builds one chip per active filter and removes them individually", () => {
    const chips = buildChairChips({
      filters: { page: 1, status: ChairStatus.Maintenance, floorZone: FloorZone.Men, branchId: "b1", search: "x" },
      dictionary: enDictionary,
      branchLabel: () => "Downtown",
    });
    expect(chips.map((chip) => chip.key)).toEqual([CHAIR_CHIP_KEY.status, CHAIR_CHIP_KEY.zone, CHAIR_CHIP_KEY.branch, CHAIR_CHIP_KEY.search]);
    expect(chips[2]?.valueLabel).toBe("Downtown");
    expect(chairPatchForChip(CHAIR_CHIP_KEY.zone)).toEqual({ floorZone: undefined });
    expect(chairPatchForChip("unknown")).toEqual({});
  });
});
