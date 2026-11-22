import { META_DESCRIPTION_MAX_LENGTH } from "@/config/public-profile.constant";
import { DEFAULT_LOCALE } from "@/config/locales.constant";
import type { Locale } from "@/enums/access/locale.enum";
import type { PublicHoursDay } from "@/types/public/public-profile.type";

type Translatable = string | Record<string, string | null> | null | undefined;

/** The text in the visitor's language, else the other language, else "". Never throws on a missing map. */
export function pickText(text: Translatable, locale: Locale): string {
  if (typeof text === "string") return text;
  if (!text) return "";
  return text[locale]?.trim() || text[DEFAULT_LOCALE]?.trim() || Object.values(text).find((value) => value?.trim())?.trim() || "";
}

/** A search or social preview line: one paragraph, cut at the limit with an ellipsis. */
export function metaDescription(text: string): string {
  const flat = text.replace(/\s+/g, " ").trim();
  return flat.length <= META_DESCRIPTION_MAX_LENGTH ? flat : `${flat.slice(0, META_DESCRIPTION_MAX_LENGTH - 1).trimEnd()}…`;
}

/** "09:00:00" becomes "09:00". */
export function shortTime(time: string): string {
  return time.slice(0, 5);
}

/** The week starting on `weekStart` (0 is Sunday); a day the branch never configured is closed. */
export function weekRows(days: readonly PublicHoursDay[], weekStart: number): PublicHoursDay[] {
  const byDay = new Map(days.map((day) => [day.day_of_week, day]));
  return Array.from({ length: 7 }, (_, offset) => {
    const dayOfWeek = (weekStart + offset) % 7;
    return byDay.get(dayOfWeek) ?? { day_of_week: dayOfWeek, is_closed: true, shifts: [] };
  });
}

/** `https://site/path` when an origin is configured, else the bare path. Ignores a malformed origin. */
export function absoluteUrl(origin: string | undefined, path: string): string {
  try {
    return origin ? new URL(path, origin).toString() : path;
  } catch {
    return path;
  }
}
