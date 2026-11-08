import { describe, expect, it } from "vitest";

import { searchFromParams, searchToParams } from "@/lib/service-filters.util";

describe("service filters", () => {
  it("reads, trims and bounds the search", () => {
    expect(searchFromParams(new URLSearchParams("search=%20cut%20"))).toBe("cut");
    expect(searchFromParams(new URLSearchParams(""))).toBeUndefined();
    expect(searchFromParams(new URLSearchParams(`search=${"a".repeat(300)}`))?.length).toBe(100);
  });

  // The query strings the earlier `searchToQuery` wrote, pinned so the URL stays the same.
  it("writes nothing for an empty search and the same encoded query otherwise", () => {
    expect(searchToParams(undefined).toString()).toBe("");
    expect(searchToParams("").toString()).toBe("");
    expect(searchToParams("a b").toString()).toBe("search=a+b");
    expect(searchToParams("قص").toString()).toBe("search=%D9%82%D8%B5");
  });

  it("round-trips through the reader", () => {
    expect(searchFromParams(searchToParams("fade & beard"))).toBe("fade & beard");
    expect(searchFromParams(searchToParams(undefined))).toBeUndefined();
  });
});
