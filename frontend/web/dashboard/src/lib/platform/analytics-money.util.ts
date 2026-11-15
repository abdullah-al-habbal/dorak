import type { MoneyTotal } from "@/types/core/money-total.type";

export interface CurrencyRow {
  currency: string;
  recurring: number;
  pending: number;
  settled: number;
}

/** Joins the three per-currency lists into one row per currency, sorted by code. Amounts are never converted between currencies. */
export function currencyRows(recurring: readonly MoneyTotal[], pending: readonly MoneyTotal[], settled: readonly MoneyTotal[]): CurrencyRow[] {
  const rows = new Map<string, CurrencyRow>();
  const row = (currency: string): CurrencyRow => {
    const existing = rows.get(currency) ?? { currency, recurring: 0, pending: 0, settled: 0 };
    rows.set(currency, existing);
    return existing;
  };
  for (const entry of recurring) row(entry.currency).recurring = entry.total_amount_minor;
  for (const entry of pending) row(entry.currency).pending = entry.total_amount_minor;
  for (const entry of settled) row(entry.currency).settled = entry.total_amount_minor;
  return [...rows.values()].sort((a, b) => a.currency.localeCompare(b.currency));
}
