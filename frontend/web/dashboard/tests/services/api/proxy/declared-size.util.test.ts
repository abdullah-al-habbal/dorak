import { describe, expect, it } from "vitest";

import { exceedsDeclaredSize } from "@/services/api/proxy/declared-size.util";

describe("exceedsDeclaredSize", () => {
  it("compares the announced length with the limit", () => {
    expect(exceedsDeclaredSize(new Headers({ "content-length": "101" }), 100)).toBe(true);
    expect(exceedsDeclaredSize(new Headers({ "content-length": "100" }), 100)).toBe(false);
  });

  it("does not refuse when no usable length is announced", () => {
    expect(exceedsDeclaredSize(new Headers(), 100)).toBe(false);
    expect(exceedsDeclaredSize(new Headers({ "content-length": "abc" }), 100)).toBe(false);
  });
});
