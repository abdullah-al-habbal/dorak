import { EARNINGS_FLAT_THRESHOLD_PERCENT, EARNINGS_PERCENT } from "@/config/money-shell/earnings.constant";
import { TrendDirection } from "@/enums/ui/trend-direction.enum";
import type { EarningsTrend } from "@/interfaces/earnings/earnings-trend.interface";
import type { Earnings } from "@/types/earnings/earnings.type";
import type { EarningsTotal } from "@/types/earnings/earnings-total.type";

/** Every currency the period has revenue in. Totals are never summed across currencies. */
export function currencyCodes(earnings: Earnings): string[] {
  const codes = new Set<string>([...earnings.totals.map((total) => total.currency_code), ...earnings.series.map((point) => point.currency_code)]);
  return [...codes].sort();
}

export function totalFor(totals: readonly EarningsTotal[] | null | undefined, currency: string): EarningsTotal | null {
  return totals?.find((total) => total.currency_code === currency) ?? null;
}

/** Revenue per completed booking, in minor units. Null when nothing was completed. */
export function averageTicket(total: EarningsTotal | null): number | null {
  if (!total || total.completed_bookings_count === 0) return null;
  return Math.round(total.gross_minor / total.completed_bookings_count);
}

/** Change from the previous period. A zero base reads "new" instead of an infinite percentage. */
export function computeTrend(current: number, previous: number | null | undefined): EarningsTrend | null {
  if (previous === null || previous === undefined) return null;
  if (previous === 0) return { direction: current === 0 ? TrendDirection.Flat : TrendDirection.New, percent: null };
  const percent = ((current - previous) / Math.abs(previous)) * EARNINGS_PERCENT;
  if (Math.abs(percent) < EARNINGS_FLAT_THRESHOLD_PERCENT) return { direction: TrendDirection.Flat, percent: 0 };
  return { direction: percent > 0 ? TrendDirection.Up : TrendDirection.Down, percent: Math.abs(percent) };
}
