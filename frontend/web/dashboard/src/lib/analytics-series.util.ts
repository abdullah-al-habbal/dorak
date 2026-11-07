import { addDays, parseDateKey, toDateKey } from "@/lib/booking-date.util";
import type { EarningsRange } from "@/types/earnings-range.type";

export interface DailyCount {
  date: string;
  count: number;
}

/** One entry per calendar day of the range, zero where the backend reported nothing, so the bars keep their spacing. */
export function fillDailyCounts(series: readonly DailyCount[], range: EarningsRange): DailyCount[] {
  const start = parseDateKey(range.from);
  const end = parseDateKey(range.to);
  if (!start || !end || end < start) return [];
  const byDate = new Map(series.map((entry) => [entry.date, entry.count]));
  const days: DailyCount[] = [];
  for (let day = start; day <= end; day = addDays(day, 1)) {
    const key = toDateKey(day);
    days.push({ date: key, count: byDate.get(key) ?? 0 });
  }
  return days;
}

export function sumCounts(entries: readonly { count: number }[]): number {
  return entries.reduce((sum, entry) => sum + entry.count, 0);
}
