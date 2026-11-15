import { EARNINGS_PERCENT } from "@/config/earnings.constant";
import { parseDateKey } from "@/lib/booking-date.util";

/** `0.5` percent points become "0.5%"; whole numbers drop the decimals. */
export function formatPercent(percent: number, locale: string): string {
  return new Intl.NumberFormat(locale, { style: "percent", maximumFractionDigits: 1 }).format(percent / EARNINGS_PERCENT);
}

export function formatCount(count: number, locale: string): string {
  return new Intl.NumberFormat(locale).format(count);
}

/** "Mar 10" style label for a `YYYY-MM-DD` key; the key itself if it does not parse. */
export function formatShortDate(key: string, locale: string): string {
  const date = parseDateKey(key);
  return date ? new Intl.DateTimeFormat(locale, { month: "short", day: "numeric" }).format(date) : key;
}
