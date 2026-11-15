import { splitDuration } from "@/lib/core/duration.util";
import { formatPrice } from "@/lib/core/booking-format.util";
import type { Dictionary } from "@/types/core/dictionary.type";

/** "1 h 30 min", "45 min" or "1 h", from the dictionary's unit templates. */
export function formatDuration(minutes: number, dictionary: Dictionary): string {
  const { hours, minutes: rest } = splitDuration(minutes);
  const { duration } = dictionary.services;
  const parts: string[] = [];
  if (hours > 0) parts.push(duration.hours.replace("{count}", String(hours)));
  if (rest > 0) parts.push(duration.minutes.replace("{count}", String(rest)));
  return parts.join(" ");
}

export function formatServicePrice(minor: number, currency: string, locale: string, dictionary: Dictionary): string {
  return minor === 0 ? dictionary.services.free : formatPrice(minor, currency, locale);
}
