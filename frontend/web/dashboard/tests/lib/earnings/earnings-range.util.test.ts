import { describe, expect, it } from "vitest";

import { EarningsPreset } from "@/enums/money/earnings-preset.enum";
import { daysInRange, detectPreset, presetRange, rangeFromParams, rangeIssue, rangeToParams, EarningsRangeIssue } from "@/lib/earnings/earnings-range.util";

const TODAY = new Date(2026, 2, 15); // 15 March 2026

describe("presetRange", () => {
  it("covers today, rolling windows and calendar months", () => {
    expect(presetRange(EarningsPreset.Today, TODAY)).toEqual({ from: "2026-03-15", to: "2026-03-15" });
    expect(presetRange(EarningsPreset.Last7Days, TODAY)).toEqual({ from: "2026-03-09", to: "2026-03-15" });
    expect(presetRange(EarningsPreset.Last30Days, TODAY)).toEqual({ from: "2026-02-14", to: "2026-03-15" });
    expect(presetRange(EarningsPreset.ThisMonth, TODAY)).toEqual({ from: "2026-03-01", to: "2026-03-15" });
    expect(presetRange(EarningsPreset.LastMonth, TODAY)).toEqual({ from: "2026-02-01", to: "2026-02-28" });
  });

  it("handles January (previous month is December) and leap Februaries", () => {
    expect(presetRange(EarningsPreset.LastMonth, new Date(2026, 0, 10))).toEqual({ from: "2025-12-01", to: "2025-12-31" });
    expect(presetRange(EarningsPreset.LastMonth, new Date(2024, 2, 10))).toEqual({ from: "2024-02-01", to: "2024-02-29" });
  });
});

describe("daysInRange", () => {
  it("counts both ends and does not drift across a DST change", () => {
    expect(daysInRange({ from: "2026-03-15", to: "2026-03-15" })).toBe(1);
    expect(daysInRange({ from: "2026-03-01", to: "2026-03-31" })).toBe(31);
    expect(daysInRange({ from: "2026-03-28", to: "2026-03-30" })).toBe(3);
  });
});

describe("rangeIssue", () => {
  it("rejects inverted, unparsable and over-long ranges", () => {
    expect(rangeIssue({ from: "2026-03-02", to: "2026-03-01" })).toBe(EarningsRangeIssue.Inverted);
    expect(rangeIssue({ from: "2026-02-30", to: "2026-03-01" })).toBe(EarningsRangeIssue.Invalid);
    expect(rangeIssue({ from: "2025-01-01", to: "2026-03-01" })).toBe(EarningsRangeIssue.TooLong);
    expect(rangeIssue({ from: "2025-03-01", to: "2026-03-01" })).toBeNull();
  });
});

describe("range <-> URL", () => {
  it("falls back to the last 30 days for missing or invalid params", () => {
    const fallback = { from: "2026-02-14", to: "2026-03-15" };
    expect(rangeFromParams(new URLSearchParams(), TODAY)).toEqual(fallback);
    expect(rangeFromParams(new URLSearchParams("from=nope&to=2026-03-01"), TODAY)).toEqual(fallback);
    expect(rangeFromParams(new URLSearchParams("from=2026-03-05&to=2026-03-01"), TODAY)).toEqual(fallback);
  });

  it("round-trips a custom range and keeps the default URL clean", () => {
    const custom = { from: "2026-01-01", to: "2026-01-31" };
    expect(rangeFromParams(rangeToParams(custom, TODAY), TODAY)).toEqual(custom);
    expect(rangeToParams(presetRange(EarningsPreset.Last30Days, TODAY), TODAY).toString()).toBe("");
  });

  it("names the preset a range equals", () => {
    expect(detectPreset(presetRange(EarningsPreset.ThisMonth, TODAY), TODAY)).toBe(EarningsPreset.ThisMonth);
    expect(detectPreset({ from: "2026-01-01", to: "2026-01-02" }, TODAY)).toBe(EarningsPreset.Custom);
  });
});
