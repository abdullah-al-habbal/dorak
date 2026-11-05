export const MIN_DURATION_MINUTES = 1;
export const MAX_DURATION_MINUTES = 1440;
export const DURATION_PRESETS = [15, 30, 45, 60, 90, 120] as const;
const MINUTES_PER_HOUR = 60;

/** Parses the duration field. Empty means "no fixed duration" (null); invalid input is undefined. */
export function parseDuration(text: string): number | null | undefined {
  const trimmed = text.trim();
  if (trimmed === "") return null;
  if (!/^\d+$/.test(trimmed)) return undefined;
  const minutes = Number(trimmed);
  return minutes >= MIN_DURATION_MINUTES && minutes <= MAX_DURATION_MINUTES ? minutes : undefined;
}

/** "90" becomes { hours: 1, minutes: 30 } for display. */
export function splitDuration(minutes: number): { hours: number; minutes: number } {
  return { hours: Math.floor(minutes / MINUTES_PER_HOUR), minutes: minutes % MINUTES_PER_HOUR };
}
