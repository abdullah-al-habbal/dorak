import { describe, expect, it } from "vitest";

import { searchFromParams, searchToQuery } from "@/lib/service-filters.util";

describe("service filters", () => {
  it("reads, trims and bounds the search", () => {
    expect(searchFromParams(new URLSearchParams("search=%20cut%20"))).toBe("cut");
    expect(searchFromParams(new URLSearchParams(""))).toBeUndefined();
    expect(searchFromParams(new URLSearchParams(`search=${"a".repeat(300)}`))?.length).toBe(100);
  });

  it("writes nothing for an empty search", () => {
    expect(searchToQuery(undefined)).toBe("");
    expect(searchToQuery("a b")).toBe("search=a+b");
  });
});
