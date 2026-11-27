import { localInputToUtcIso, toLocalInput } from "@/lib/bookings/booking-datetime.util";

/**
 * Branch times (BG-55): the backend sends instants in UTC plus the branch's IANA zone. Every function falls back to
 * the browser's zone when there is no zone (an older backend).
 */
const MS_PER_MINUTE = 60_000;
const LOCAL_INPUT = /^(\d{4})-(\d{2})-(\d{2})T(\d{2}):(\d{2})/;

/**
 * A Date whose local getters read the branch's wall clock, for layout and input values. Never send it to the
 * backend or compare it with a real instant.
 */
export function branchWallClock(instant: Date | string, timeZone: string | undefined): Date {
  const date = new Date(instant);
  if (!timeZone) return date;
  const parts = wallClockParts(date.getTime(), timeZone);
  return new Date(parts.year, parts.month - 1, parts.day, parts.hour, parts.minute);
}

/** The `datetime-local` value of an instant on the branch's clock. */
export function isoToBranchInput(iso: string, timeZone: string | undefined): string {
  return toLocalInput(branchWallClock(iso, timeZone));
}

/** The UTC instant of a `datetime-local` value typed as a time on the branch's clock. */
export function branchInputToUtcIso(value: string, timeZone: string | undefined): string {
  const match = LOCAL_INPUT.exec(value);
  if (!timeZone || !match) return localInputToUtcIso(value);
  const [year, month, day, hour, minute] = match.slice(1).map(Number);
  const wall = Date.UTC(year, month - 1, day, hour, minute);
  // The offset depends on the instant, so look it up again at the first guess: it differs next to a clock change.
  const guess = wall - offsetAt(wall, timeZone);
  return new Date(wall - offsetAt(guess, timeZone)).toISOString();
}

function offsetAt(instant: number, timeZone: string): number {
  const parts = wallClockParts(instant, timeZone);
  const asUtc = Date.UTC(parts.year, parts.month - 1, parts.day, parts.hour, parts.minute);
  return asUtc - Math.floor(instant / MS_PER_MINUTE) * MS_PER_MINUTE;
}

interface WallClockParts {
  year: number;
  month: number;
  day: number;
  hour: number;
  minute: number;
}

function wallClockParts(instant: number, timeZone: string): WallClockParts {
  const formatter = new Intl.DateTimeFormat("en-US", { timeZone, hourCycle: "h23", year: "numeric", month: "numeric", day: "numeric", hour: "numeric", minute: "numeric" });
  const read: Partial<Record<Intl.DateTimeFormatPartTypes, number>> = {};
  for (const part of formatter.formatToParts(instant)) read[part.type] = Number(part.value);
  return { year: read.year ?? 0, month: read.month ?? 1, day: read.day ?? 1, hour: read.hour ?? 0, minute: read.minute ?? 0 };
}
