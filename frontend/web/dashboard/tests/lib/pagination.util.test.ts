import { describe, expect, it } from "vitest";

import { clampPage, withPage } from "@/lib/pagination.util";

describe("pagination util", () => {
  it("clamps untrusted pages into range", () => {
    expect(clampPage(0, 5)).toBe(1);
    expect(clampPage(9, 5)).toBe(5);
    expect(clampPage(2.5, 5)).toBe(1);
    expect(clampPage(3, 0)).toBe(1);
  });

  it("writes the page and keeps other params; page 1 is implicit", () => {
    expect(withPage("status=pending", 3)).toBe("status=pending&page=3");
    expect(withPage("status=pending&page=3", 1)).toBe("status=pending");
  });
});
