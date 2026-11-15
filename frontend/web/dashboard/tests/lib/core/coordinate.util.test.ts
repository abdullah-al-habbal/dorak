import { describe, expect, it } from "vitest";

import { parseCoordinate } from "@/lib/core/coordinate.util";

describe("parseCoordinate", () => {
  it("treats an empty field as no coordinate", () => {
    expect(parseCoordinate("", 90)).toBeNull();
    expect(parseCoordinate("  ", 90)).toBeNull();
  });

  it("accepts decimals inside the limit, boundaries included", () => {
    expect(parseCoordinate("24.7136", 90)).toBe(24.7136);
    expect(parseCoordinate("-90", 90)).toBe(-90);
    expect(parseCoordinate("180", 180)).toBe(180);
  });

  it("rejects out-of-range and non-numeric text", () => {
    expect(parseCoordinate("90.1", 90)).toBeUndefined();
    expect(parseCoordinate("abc", 90)).toBeUndefined();
    expect(parseCoordinate("1e3", 180)).toBeUndefined();
    expect(parseCoordinate("12,5", 90)).toBeUndefined();
  });
});
