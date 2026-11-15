import { describe, expect, it } from "vitest";

import { BarberStatus } from "@/enums/barber-status.enum";
import { filtersFromParams, filtersToParams } from "@/lib/stylist-filters.util";

describe("stylist filters", () => {
  it("round-trips through the URL", () => {
    const filters = { search: "ali", chairId: "c1", status: BarberStatus.Disabled, page: 2 };
    expect(filtersFromParams(filtersToParams(filters))).toEqual(filters);
  });

  it("drops invalid values and keeps the URL empty by default", () => {
    expect(filtersFromParams(new URLSearchParams("status=banned&page=0"))).toEqual({ search: undefined, chairId: undefined, status: undefined, page: 1 });
    expect(filtersToParams({ page: 1 }).toString()).toBe("");
  });
});
