import {
  EARNINGS_DEFAULT_PRESET,
  EARNINGS_LAST_7_DAYS,
  EARNINGS_LAST_30_DAYS,
  EARNINGS_MAX_RANGE_DAYS,
} from "@/config/money-shell/earnings.constant";
import { EarningsPreset } from "@/enums/money/earnings-preset.enum";
import { addDays, parseDateKey, toDateKey } from "@/lib/bookings/booking-date.util";
import type { EarningsRange } from "@/types/earnings/earnings-range.type";

const MS_PER_DAY = 86_400_000;

export enum EarningsRangeIssue {
  Inverted = "inverted",
  TooLong = "tooLong",
  Invalid = "invalid",
}

/** The range a preset stands for, in the viewer's local calendar. Custom has no range of its own. */
export function presetRange(preset: EarningsPreset, today: Date): EarningsRange {
  const key = toDateKey(today);
  switch (preset) {
    case EarningsPreset.Today:
      return { from: key, to: key };
    case EarningsPreset.Last7Days:
      return { from: toDateKey(addDays(today, 1 - EARNINGS_LAST_7_DAYS)), to: key };
    case EarningsPreset.ThisMonth:
      return { from: toDateKey(new Date(today.getFullYear(), today.getMonth(), 1)), to: key };
    case EarningsPreset.LastMonth:
      return {
        from: toDateKey(new Date(today.getFullYear(), today.getMonth() - 1, 1)),
        to: toDateKey(new Date(today.getFullYear(), today.getMonth(), 0)),
      };
    default:
      return { from: toDateKey(addDays(today, 1 - EARNINGS_LAST_30_DAYS)), to: key };
  }
}

/** Days from `from` to `to`, both included. */
export function daysInRange(range: EarningsRange): number {
  const from = parseDateKey(range.from);
  const to = parseDateKey(range.to);
  if (!from || !to) return 0;
  return Math.round((Date.UTC(to.getFullYear(), to.getMonth(), to.getDate()) - Date.UTC(from.getFullYear(), from.getMonth(), from.getDate())) / MS_PER_DAY) + 1;
}

export function rangeIssue(range: EarningsRange): EarningsRangeIssue | null {
  if (!parseDateKey(range.from) || !parseDateKey(range.to)) return EarningsRangeIssue.Invalid;
  if (range.to < range.from) return EarningsRangeIssue.Inverted;
  return daysInRange(range) > EARNINGS_MAX_RANGE_DAYS ? EarningsRangeIssue.TooLong : null;
}

/** Which preset the range equals, or Custom. */
export function detectPreset(range: EarningsRange, today: Date): EarningsPreset {
  const presets = [EarningsPreset.Today, EarningsPreset.Last7Days, EarningsPreset.Last30Days, EarningsPreset.ThisMonth, EarningsPreset.LastMonth];
  const match = presets.find((preset) => {
    const candidate = presetRange(preset, today);
    return candidate.from === range.from && candidate.to === range.to;
  });
  return match ?? EarningsPreset.Custom;
}

/** The URL is the source of truth; anything missing or invalid falls back to the default preset. */
export function rangeFromParams(params: URLSearchParams, today: Date): EarningsRange {
  const fallback = presetRange(EARNINGS_DEFAULT_PRESET, today);
  const from = params.get("from");
  const to = params.get("to");
  if (!from || !to) return fallback;
  const candidate = { from, to };
  return rangeIssue(candidate) === null ? candidate : fallback;
}

export function rangeToParams(range: EarningsRange, today: Date): URLSearchParams {
  const params = new URLSearchParams();
  const fallback = presetRange(EARNINGS_DEFAULT_PRESET, today);
  if (range.from === fallback.from && range.to === fallback.to) return params;
  params.set("from", range.from);
  params.set("to", range.to);
  return params;
}
