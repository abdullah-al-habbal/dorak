import { describe, expect, it } from "vitest";

import { clampPage } from "@/lib/core/query/pagination.util";

describe("pagination util", () => {
  it("clamps untrusted pages into range", () => {
    expect(clampPage(0, 5)).toBe(1);
    expect(clampPage(9, 5)).toBe(5);
    expect(clampPage(2.5, 5)).toBe(1);
    expect(clampPage(3, 0)).toBe(1);
  });
});
