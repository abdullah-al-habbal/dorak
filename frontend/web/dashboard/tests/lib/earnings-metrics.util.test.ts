import { describe, expect, it } from "vitest";

import { TrendDirection } from "@/enums/trend-direction.enum";
import { averageTicket, computeTrend, currencyCodes, totalFor } from "@/lib/earnings-metrics.util";
import type { Earnings } from "@/types/earnings.type";

const total = (currency: string, gross: number, count: number) => ({ currency_code: currency, gross_minor: gross, completed_bookings_count: count });

describe("averageTicket", () => {
  it("divides revenue by completed bookings and guards the zero case", () => {
    expect(averageTicket(total("USD", 10_000, 4))).toBe(2500);
    expect(averageTicket(total("USD", 10_001, 3))).toBe(3334);
    expect(averageTicket(total("USD", 0, 0))).toBeNull();
    expect(averageTicket(null)).toBeNull();
  });
});

describe("computeTrend", () => {
  it("reports direction and absolute percent", () => {
    expect(computeTrend(150, 100)).toEqual({ direction: TrendDirection.Up, percent: 50 });
    expect(computeTrend(50, 100)).toEqual({ direction: TrendDirection.Down, percent: 50 });
    expect(computeTrend(100.2, 100)).toEqual({ direction: TrendDirection.Flat, percent: 0 });
  });

  it("reads a zero base as new, not infinity, and hides the trend without a comparison", () => {
    expect(computeTrend(500, 0)).toEqual({ direction: TrendDirection.New, percent: null });
    expect(computeTrend(0, 0)).toEqual({ direction: TrendDirection.Flat, percent: null });
    expect(computeTrend(500, null)).toBeNull();
    expect(computeTrend(500, undefined)).toBeNull();
  });

  it("keeps the sign of a refund-heavy previous period from inverting direction", () => {
    expect(computeTrend(100, -100)?.direction).toBe(TrendDirection.Up);
  });
});

describe("currencies", () => {
  const earnings: Earnings = {
    scope: "branch",
    totals: [total("USD", 1, 1), total("SYP", 2, 1)],
    series: [{ date: "2026-03-01", currency_code: "EUR", gross_minor: 1, completed_bookings_count: 1 }],
    previous_totals: null,
  };

  it("lists every currency once, sorted, and finds a total by code", () => {
    expect(currencyCodes(earnings)).toEqual(["EUR", "SYP", "USD"]);
    expect(totalFor(earnings.totals, "SYP")?.gross_minor).toBe(2);
    expect(totalFor(earnings.totals, "EUR")).toBeNull();
    expect(totalFor(null, "USD")).toBeNull();
  });
});
