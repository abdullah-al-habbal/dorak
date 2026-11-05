import type { Locale } from "@/enums/locale.enum";
import type { Weekday } from "@/enums/weekday.enum";

/** 2023-01-01 is a Sunday, so adding the weekday index lands on that day. */
const SUNDAY_EPOCH = Date.UTC(2023, 0, 1);
const MS_PER_DAY = 86_400_000;

export function weekdayLabel(day: Weekday, locale: Locale, width: "long" | "short" = "long"): string {
  return new Intl.DateTimeFormat(locale, { weekday: width, timeZone: "UTC" }).format(new Date(SUNDAY_EPOCH + day * MS_PER_DAY));
}
