import { describe, expect, it } from "vitest";

import { NOINDEX_ROBOTS } from "@/config/seo.constant";

describe("NOINDEX_ROBOTS", () => {
  it("keeps the whole dashboard out of search indexes and stops crawlers following links", () => {
    expect(NOINDEX_ROBOTS).toEqual({ index: false, follow: false });
  });
});
