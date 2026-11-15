import { describe, expect, it } from "vitest";

import { BranchStatus } from "@/enums/branch-status.enum";
import { BRANCH_CLEAR_ALL_PATCH, branchPatchForChip, buildBranchChips } from "@/lib/branches/branch-chips.util";
import { enDictionary } from "@/locales/en/index.constant";

describe("branch filter chips", () => {
  it("shows one chip per active filter with readable values", () => {
    const chips = buildBranchChips({ filters: { status: BranchStatus.Enabled, brandId: "b1", search: "Down", page: 1 }, dictionary: enDictionary, brandLabel: () => "Acme" });
    expect(chips.map((chip) => [chip.key, chip.valueLabel])).toEqual([["status", "Active"], ["brand", "Acme"], ["search", "Down"]]);
  });

  it("has no chips without filters, and each chip clears its own filter", () => {
    expect(buildBranchChips({ filters: { page: 2 }, dictionary: enDictionary, brandLabel: String })).toEqual([]);
    expect(branchPatchForChip("brand")).toEqual({ brandId: undefined });
    expect(branchPatchForChip("unknown")).toEqual({});
    expect(Object.keys(BRANCH_CLEAR_ALL_PATCH).sort()).toEqual(["brandId", "search", "status"]);
  });
});
