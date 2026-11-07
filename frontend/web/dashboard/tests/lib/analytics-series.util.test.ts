import { describe, expect, it } from "vitest";

import { currencyRows } from "@/lib/analytics-money.util";
import { fillDailyCounts, sumCounts } from "@/lib/analytics-series.util";

describe("fillDailyCounts", () => {
  it("returns one entry per day with zeros for the gaps", () => {
    const days = fillDailyCounts([{ date: "2026-03-02", count: 4 }], { from: "2026-03-01", to: "2026-03-03" });
    expect(days).toEqual([
      { date: "2026-03-01", count: 0 },
      { date: "2026-03-02", count: 4 },
      { date: "2026-03-03", count: 0 },
    ]);
  });

  it("returns nothing for an invalid or reversed range", () => {
    expect(fillDailyCounts([], { from: "2026-03-05", to: "2026-03-01" })).toEqual([]);
    expect(fillDailyCounts([], { from: "soon", to: "later" })).toEqual([]);
  });

  it("sums counts", () => {
    expect(sumCounts([{ count: 2 }, { count: 5 }])).toBe(7);
    expect(sumCounts([])).toBe(0);
  });
});

describe("currencyRows", () => {
  it("joins the three lists per currency without converting between them", () => {
    const rows = currencyRows(
      [{ currency: "USD", total_amount_minor: 1000 }],
      [{ currency: "SYP", total_amount_minor: 50 }, { currency: "USD", total_amount_minor: 300 }],
      [{ currency: "USD", total_amount_minor: 900 }],
    );
    expect(rows).toEqual([
      { currency: "SYP", recurring: 0, pending: 50, settled: 0 },
      { currency: "USD", recurring: 1000, pending: 300, settled: 900 },
    ]);
  });

  it("is empty when nothing was reported", () => {
    expect(currencyRows([], [], [])).toEqual([]);
  });
});
