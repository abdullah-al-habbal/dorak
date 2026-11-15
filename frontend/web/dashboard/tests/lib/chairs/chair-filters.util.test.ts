import { describe, expect, it } from "vitest";

import { ChairStatus } from "@/enums/venue/chair-status.enum";
import { FloorZone } from "@/enums/people/floor-zone.enum";
import { chairFiltersFromParams, chairFiltersToParams, chairQueryString } from "@/lib/chairs/chair-filters.util";

describe("chair filters", () => {
  it("parses valid params and drops invalid enum values", () => {
    const filters = chairFiltersFromParams(new URLSearchParams("status=maintenance&zone=women&branch=b1&search=front&page=3"));
    expect(filters).toEqual({ status: ChairStatus.Maintenance, floorZone: FloorZone.Women, branchId: "b1", search: "front", page: 3 });
    expect(chairFiltersFromParams(new URLSearchParams("status=bogus&zone=x&page=-2"))).toEqual({
      status: undefined,
      floorZone: undefined,
      branchId: undefined,
      search: undefined,
      page: 1,
    });
  });

  it("round-trips through the URL and omits page 1", () => {
    const params = chairFiltersToParams({ status: ChairStatus.Available, floorZone: FloorZone.Men, page: 1 });
    expect(params.toString()).toBe("status=available&zone=men");
  });

  it("maps to the backend query names", () => {
    const query = new URLSearchParams(chairQueryString({ status: ChairStatus.Occupied, floorZone: FloorZone.Shared, branchId: "b1", search: "a", page: 2 }, 20));
    expect(Object.fromEntries(query)).toEqual({ per_page: "20", page: "2", search: "a", branch_id: "b1", status: "occupied", floor_zone: "shared" });
  });
});
