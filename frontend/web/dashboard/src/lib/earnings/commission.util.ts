import { BPS_PER_PERCENT } from "@/config/commission.constant";
import { formatPrice } from "@/lib/booking-format.util";
import type { CommissionEntry } from "@/types/earnings/commission.type";

/** "2.5" becomes 250 basis points; null when it isn't a percent between 0.01 and 100 with at most two decimals. */
export function percentToBps(text: string): number | null {
  if (!/^\d+(\.\d{1,2})?$/.test(text.trim())) return null;
  const bps = Math.round(Number(text) * BPS_PER_PERCENT);
  return bps >= 1 && bps <= 100 * BPS_PER_PERCENT ? bps : null;
}

export function bpsToPercent(bps: number): string {
  return String(bps / BPS_PER_PERCENT);
}

export interface CurrencyTotal {
  code: string;
  base: number;
  commission: number;
}

/** Totals per currency. Amounts in different currencies are never added together. */
export function totalsByCurrency(entries: readonly CommissionEntry[]): CurrencyTotal[] {
  const totals = new Map<string, CurrencyTotal>();
  for (const entry of entries) {
    const code = entry.currency?.code ?? "";
    const held = totals.get(code) ?? { code, base: 0, commission: 0 };
    held.base += entry.base_amount_minor;
    held.commission += entry.commission_amount_minor;
    totals.set(code, held);
  }
  return [...totals.values()];
}

export function money(minor: number, code: string, locale: string): string {
  return formatPrice(minor, code || null, locale);
}
