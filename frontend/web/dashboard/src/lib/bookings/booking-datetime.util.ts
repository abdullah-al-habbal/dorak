const PAD = 2;
const DEFAULT_WALK_IN_LEAD_MINUTES = 15;
const MS_PER_MINUTE = 60_000;

function pad(value: number): string {
  return String(value).padStart(PAD, "0");
}

/** Formats a Date as the `YYYY-MM-DDTHH:mm` value a datetime-local input expects, in local time. */
export function toLocalInput(date: Date): string {
  return `${date.getFullYear()}-${pad(date.getMonth() + 1)}-${pad(date.getDate())}T${pad(date.getHours())}:${pad(date.getMinutes())}`;
}

export function isoToLocalInput(iso: string): string {
  return toLocalInput(new Date(iso));
}

/** Parses a datetime-local value as local time. Returns null for empty or invalid input. */
export function parseLocalInput(value: string): Date | null {
  if (!value) return null;
  const date = new Date(value);
  return Number.isNaN(date.getTime()) ? null : date;
}

/** The backend only accepts UTC timestamps ending in Z or +00:00. */
export function localInputToUtcIso(value: string): string {
  const date = parseLocalInput(value);
  if (!date) throw new RangeError("Invalid local date-time.");
  return date.toISOString();
}

/** A sensible default start for a walk-in: shortly from now, so it passes the future-only rule. */
export function defaultWalkInStart(now: Date): string {
  return toLocalInput(new Date(now.getTime() + DEFAULT_WALK_IN_LEAD_MINUTES * MS_PER_MINUTE));
}
