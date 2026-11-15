import { describe, expect, it } from "vitest";

import { BranchStatus } from "@/enums/venue/branch-status.enum";
import { branchFiltersFromParams, branchFiltersToParams, branchQueryString } from "@/lib/branches/branch-filters.util";

describe("branch filters", () => {
  it("parses valid params and drops invalid values", () => {
    expect(branchFiltersFromParams(new URLSearchParams("status=disabled&brand=b1&search=Down&page=3"))).toEqual({
      status: BranchStatus.Disabled,
      brandId: "b1",
      search: "Down",
      page: 3,
    });
    expect(branchFiltersFromParams(new URLSearchParams("status=bogus&page=-2"))).toEqual({ status: undefined, brandId: undefined, search: undefined, page: 1 });
  });

  it("caps the search length like the backend", () => {
    expect(branchFiltersFromParams(new URLSearchParams(`search=${"a".repeat(150)}`)).search).toHaveLength(100);
  });

  it("round-trips through the URL and omits page 1", () => {
    expect(branchFiltersToParams({ status: BranchStatus.Enabled, brandId: "b1", page: 1 }).toString()).toBe("brand=b1&status=enabled");
    expect(branchFiltersToParams({ page: 2 }).toString()).toBe("page=2");
  });

  it("maps to the backend query names", () => {
    const query = new URLSearchParams(branchQueryString({ status: BranchStatus.Pending, brandId: "b1", search: "x", page: 2 }, 20));
    expect(Object.fromEntries(query)).toEqual({ per_page: "20", page: "2", search: "x", brand_id: "b1", status: "pending" });
  });
});
