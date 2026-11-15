import { EARNINGS_DAYS_PER_WEEK, EARNINGS_MAX_DAILY_BARS } from "@/config/earnings.constant";
import { addDays, parseDateKey, toDateKey } from "@/lib/bookings/booking-date.util";
import { daysInRange } from "@/lib/earnings/earnings-range.util";
import type { EarningsBucket } from "@/interfaces/earnings/earnings-bucket.interface";
import type { EarningsSeriesPoint } from "@/types/earnings/earnings-series-point.type";
import type { EarningsRange } from "@/types/earnings/earnings-range.type";

/** One bucket per day of the range, zero-filled, for one currency. */
export function dailyBuckets(series: readonly EarningsSeriesPoint[], currency: string, range: EarningsRange): EarningsBucket[] {
  const start = parseDateKey(range.from);
  if (!start) return [];
  const byDate = new Map(series.filter((point) => point.currency_code === currency).map((point) => [point.date, point]));
  return Array.from({ length: daysInRange(range) }, (_, offset) => {
    const key = toDateKey(addDays(start, offset));
    const point = byDate.get(key);
    return { start: key, end: key, gross_minor: point?.gross_minor ?? 0, bookings: point?.completed_bookings_count ?? 0 };
  });
}

function mergeBuckets(days: readonly EarningsBucket[]): EarningsBucket {
  return {
    start: days[0].start,
    end: days[days.length - 1].end,
    gross_minor: days.reduce((sum, day) => sum + day.gross_minor, 0),
    bookings: days.reduce((sum, day) => sum + day.bookings, 0),
  };
}

/** Days, or weeks counted from the range start when the range is too long for readable daily bars. */
export function chartBuckets(series: readonly EarningsSeriesPoint[], currency: string, range: EarningsRange): EarningsBucket[] {
  const days = dailyBuckets(series, currency, range);
  if (days.length <= EARNINGS_MAX_DAILY_BARS) return days;
  const weeks: EarningsBucket[] = [];
  for (let index = 0; index < days.length; index += EARNINGS_DAYS_PER_WEEK) {
    weeks.push(mergeBuckets(days.slice(index, index + EARNINGS_DAYS_PER_WEEK)));
  }
  return weeks;
}
