import { EarningsPreset } from "@/enums/money/earnings-preset.enum";

/** Presets shown as chips, in order; Custom is reached through the date fields. */
export const EARNINGS_PRESETS: readonly EarningsPreset[] = [
  EarningsPreset.Today,
  EarningsPreset.Last7Days,
  EarningsPreset.Last30Days,
  EarningsPreset.ThisMonth,
  EarningsPreset.LastMonth,
];
export const EARNINGS_DEFAULT_PRESET = EarningsPreset.Last30Days;
export const EARNINGS_LAST_7_DAYS = 7;
export const EARNINGS_LAST_30_DAYS = 30;
/** The backend rejects nothing here, but a year is the longest range the chart stays readable for. */
export const EARNINGS_MAX_RANGE_DAYS = 366;
/** Above this many days the chart groups days into weeks so bars stay wide enough to read. */
export const EARNINGS_MAX_DAILY_BARS = 62;
export const EARNINGS_DAYS_PER_WEEK = 7;
export const EARNINGS_PERCENT = 100;
/** Percent changes below this read as "no change". */
export const EARNINGS_FLAT_THRESHOLD_PERCENT = 0.5;
export const EARNINGS_CSV_BOM = "﻿";
export const EARNINGS_CSV_FORMULA_PREFIXES: readonly string[] = ["=", "+", "-", "@", "\t", "\r"];
export const EARNINGS_COMPACT_BREAKPOINT_PX = 640;
