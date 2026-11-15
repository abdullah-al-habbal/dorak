import { toCsv } from "@/lib/csv.util";
import { minorUnitsToInput } from "@/lib/money.util";
import type { Earnings } from "@/types/earnings/earnings.type";
import type { EarningsRange } from "@/types/earnings/earnings-range.type";

export interface EarningsCsvHeaders {
  date: string;
  currency: string;
  bookings: string;
  revenue: string;
}

export function earningsFilename(range: EarningsRange): string {
  return `earnings_${range.from}_${range.to}.csv`;
}

/** One row per day and currency with revenue in major units (12.50), so it sums in a spreadsheet. */
export function earningsCsv(earnings: Earnings, headers: EarningsCsvHeaders): string {
  const rows = earnings.series.map((point) => [point.date, point.currency_code, point.completed_bookings_count, minorUnitsToInput(point.gross_minor)]);
  return toCsv([[headers.date, headers.currency, headers.bookings, headers.revenue], ...rows]);
}
