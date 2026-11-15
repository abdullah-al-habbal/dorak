import { describe, expect, it } from "vitest";

import { currentRateIds } from "@/lib/core/exchange-rate.util";
import type { ExchangeRate } from "@/types/platform/currency-admin.type";

function rate(id: string, from: string, to: string, effective_at: string | null): ExchangeRate {
  return { id, from_currency_code: from, to_currency_code: to, rate_ratio: "1", effective_at };
}

const now = new Date("2026-06-01T00:00:00Z");

describe("currentRateIds", () => {
  it("picks the newest rate that already took effect, per pair", () => {
    const ids = currentRateIds(
      [
        rate("old", "USD", "SYP", "2026-01-01T00:00:00Z"),
        rate("current", "USD", "SYP", "2026-05-01T00:00:00Z"),
        rate("future", "USD", "SYP", "2026-07-01T00:00:00Z"),
        rate("other-pair", "SYP", "USD", "2026-02-01T00:00:00Z"),
      ],
      now,
    );
    expect([...ids].sort()).toEqual(["current", "other-pair"]);
  });

  it("ignores rates without an effective date and handles an empty list", () => {
    expect(currentRateIds([rate("none", "USD", "EUR", null)], now).size).toBe(0);
    expect(currentRateIds([], now).size).toBe(0);
  });

  it("treats a rate effective exactly now as current", () => {
    expect(currentRateIds([rate("edge", "USD", "EUR", now.toISOString())], now).has("edge")).toBe(true);
  });
});
