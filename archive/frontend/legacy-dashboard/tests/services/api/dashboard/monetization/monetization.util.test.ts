import { describe, expect, it } from "vitest";
import {
  basisPointsToPercent,
  formatMinorUnits,
  fromMinorUnits,
  parseConfigLines,
  percentToBasisPoints,
  toMinorUnits,
} from "@/services/api/dashboard/monetization/monetization.util";

describe("monetization money helpers", () => {
  it("converts between major and minor units without float drift", () => {
    expect(toMinorUnits(12.5)).toBe(1250);
    expect(toMinorUnits(0.07)).toBe(7);
    expect(toMinorUnits(19.99)).toBe(1999);
    expect(fromMinorUnits(1250)).toBe(12.5);
    expect(formatMinorUnits(4900, "JOD")).toBe("49.00 JOD");
  });

  it("converts percentages to basis points and back", () => {
    expect(percentToBasisPoints(12.5)).toBe(1250);
    expect(basisPointsToPercent(1250)).toBe(12.5);
  });

  it("parses key=value lines and ignores blanks and malformed lines", () => {
    expect(
      parseConfigLines("merchant_id = m-1\n\nsecret=a=b\nnonsense\n=x"),
    ).toEqual({ merchant_id: "m-1", secret: "a=b" });
    expect(parseConfigLines("")).toEqual({});
  });
});
