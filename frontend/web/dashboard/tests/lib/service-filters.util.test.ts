import { describe, expect, it } from "vitest";

import { serviceFiltersFromParams, serviceFiltersToParams } from "@/lib/service-filters.util";

describe("service filters", () => {
  it("reads, trims and bounds the search, and reads the brand", () => {
    expect(serviceFiltersFromParams(new URLSearchParams("search=%20cut%20")).search).toBe("cut");
    expect(serviceFiltersFromParams(new URLSearchParams("")).search).toBeUndefined();
    expect(serviceFiltersFromParams(new URLSearchParams(`search=${"a".repeat(300)}`)).search?.length).toBe(100);
    expect(serviceFiltersFromParams(new URLSearchParams("brand=b1")).brandId).toBe("b1");
  });

  // The query strings the earlier `searchToQuery` wrote, pinned so the URL stays the same.
  it("writes nothing for an empty search and the same encoded query otherwise", () => {
    expect(serviceFiltersToParams({ page: 1 }).toString()).toBe("");
    expect(serviceFiltersToParams({ search: "", page: 1 }).toString()).toBe("");
    expect(serviceFiltersToParams({ search: "a b", page: 1 }).toString()).toBe("search=a+b");
    expect(serviceFiltersToParams({ search: "قص", page: 1 }).toString()).toBe("search=%D9%82%D8%B5");
    expect(serviceFiltersToParams({ brandId: "b1", page: 1 }).toString()).toBe("brand=b1");
  });

  it("round-trips through the reader", () => {
    expect(serviceFiltersFromParams(serviceFiltersToParams({ search: "fade & beard", page: 1 })).search).toBe("fade & beard");
    expect(serviceFiltersFromParams(serviceFiltersToParams({ page: 1 })).search).toBeUndefined();
  });
});
