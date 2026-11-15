import { describe, expect, it } from "vitest";

import { reviewFiltersFromParams, reviewFiltersToParams } from "@/lib/review-filters.util";

describe("review filters", () => {
  it("parses the branch and falls back to page 1 on bad input", () => {
    expect(reviewFiltersFromParams(new URLSearchParams("branch=b1&page=4"))).toEqual({ branchId: "b1", page: 4 });
    expect(reviewFiltersFromParams(new URLSearchParams("page=abc"))).toEqual({ branchId: undefined, page: 1 });
  });

  it("omits defaults when writing the URL", () => {
    expect(reviewFiltersToParams({ page: 1 }).toString()).toBe("");
    expect(reviewFiltersToParams({ branchId: "b1", page: 2 }).toString()).toBe("branch=b1&page=2");
  });
});
