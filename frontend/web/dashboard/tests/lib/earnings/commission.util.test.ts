import { describe, expect, it } from "vitest";

import { bpsToPercent, money, percentToBps, totalsByCurrency } from "@/lib/earnings/commission.util";
import type { CommissionEntry } from "@/types/earnings/commission.type";

function entry(base: number, commission: number, code?: string): CommissionEntry {
  return { id: `e-${base}`, base_amount_minor: base, commission_amount_minor: commission, currency: code ? { code } : null, created_at: "2026-01-01T00:00:00Z" };
}

describe("commission helpers", () => {
  it("turns a percent into basis points", () => {
    expect(percentToBps("2.5")).toBe(250);
    expect(percentToBps(" 10 ")).toBe(1000);
    expect(percentToBps("0.01")).toBe(1);
    expect(percentToBps("100")).toBe(10000);
  });

  it("rejects values outside 0.01 to 100 or with too many decimals", () => {
    for (const bad of ["", "0", "0.00", "100.01", "101", "-1", "1.234", "abc", "1,5"]) expect(percentToBps(bad), bad).toBeNull();
  });

  it("round-trips basis points to a percent string", () => {
    expect(bpsToPercent(250)).toBe("2.5");
    expect(bpsToPercent(10000)).toBe("100");
    expect(percentToBps(bpsToPercent(1))).toBe(1);
  });

  it("never adds amounts of different currencies", () => {
    const totals = totalsByCurrency([entry(1000, 100, "USD"), entry(500, 50, "USD"), entry(2000, 200, "SYP"), entry(10, 1)]);
    expect(totals).toEqual([
      { code: "USD", base: 1500, commission: 150 },
      { code: "SYP", base: 2000, commission: 200 },
      { code: "", base: 10, commission: 1 },
    ]);
    expect(totalsByCurrency([])).toEqual([]);
  });

  it("formats money with and without a currency", () => {
    expect(money(1250, "USD", "en")).toBe("$12.50");
    expect(money(1250, "", "en")).toBe("12.50");
  });
});
