import { describe, expect, it } from "vitest";

import { minorUnitsToInput, parseMinorUnits } from "@/lib/money.util";

describe("money util", () => {
  it("converts decimal text to minor units without float drift", () => {
    expect(parseMinorUnits("12")).toBe(1200);
    expect(parseMinorUnits("12.5")).toBe(1250);
    expect(parseMinorUnits("0.07")).toBe(7);
    expect(parseMinorUnits("19.99")).toBe(1999);
    expect(parseMinorUnits("0")).toBe(0);
  });

  it("accepts Arabic-Indic digits and the Arabic decimal separator", () => {
    expect(parseMinorUnits("١٢٫٥")).toBe(1250);
    expect(parseMinorUnits("۲۵")).toBe(2500);
  });

  it("rejects empty, negative, sub-cent and non-numeric input", () => {
    for (const bad of ["", "-1", "1.234", "abc", "1.2.3", " "]) expect(parseMinorUnits(bad)).toBeNull();
  });

  it("round-trips through the editable form", () => {
    expect(minorUnitsToInput(1250)).toBe("12.50");
    expect(parseMinorUnits(minorUnitsToInput(1999))).toBe(1999);
  });
});
