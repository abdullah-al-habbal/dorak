import {
  DAYS_IN_WEEK,
  DEFAULT_CLOSES_TIME,
  DEFAULT_OPENS_TIME,
  LAST_MINUTE_OF_DAY,
  MAX_SHIFTS_PER_DAY,
  MINUTES_PER_DAY,
  MINUTES_PER_HOUR,
  NEW_SHIFT_MINUTES,
} from "@/config/ops/working-hours.constant";
import { ShiftIssue } from "@/enums/booking/shift-issue.enum";
import { Weekday } from "@/enums/booking/weekday.enum";
import type { OpeningHoursDay } from "@/interfaces/hours/opening-hours-day.interface";
import type { OpeningHoursPayload } from "@/interfaces/hours/opening-hours-payload.interface";
import type { ShiftIssueEntry } from "@/interfaces/hours/shift-issue-entry.interface";
import type { Shift } from "@/interfaces/hours/shift.interface";
import type { OpeningHoursWeek } from "@/types/hours/opening-hours-week.type";

export const ALL_DAYS: readonly Weekday[] = [
  Weekday.Sunday,
  Weekday.Monday,
  Weekday.Tuesday,
  Weekday.Wednesday,
  Weekday.Thursday,
  Weekday.Friday,
  Weekday.Saturday,
];
const PERCENT = 100;
const TIME_PAD = 2;

function toMinutes(time: string): number {
  const [hours = "0", minutes = "0"] = time.split(":");
  return Number(hours) * MINUTES_PER_HOUR + Number(minutes);
}

function toTime(minutes: number): string {
  const clamped = Math.min(Math.max(minutes, 0), LAST_MINUTE_OF_DAY);
  const hours = String(Math.floor(clamped / MINUTES_PER_HOUR)).padStart(TIME_PAD, "0");
  const rest = String(clamped % MINUTES_PER_HOUR).padStart(TIME_PAD, "0");
  return `${hours}:${rest}`;
}

function closedDay(day: Weekday): OpeningHoursDay {
  return { day_of_week: day, is_closed: true, shifts: [] };
}

/** A branch with no saved hours reads as closed all week in the editor; nothing is sent until the manager saves. */
export function weekFromServer(days: readonly OpeningHoursDay[]): OpeningHoursWeek {
  return ALL_DAYS.map((day) => {
    const found = days.find((entry) => entry.day_of_week === day);
    if (!found || found.is_closed || found.shifts.length === 0) return closedDay(day);
    return { day_of_week: day, is_closed: false, shifts: sortShifts(found.shifts) };
  });
}

export function hasSavedHours(days: readonly OpeningHoursDay[]): boolean {
  return days.length > 0;
}

function sortShifts(shifts: readonly Shift[]): Shift[] {
  return [...shifts].sort((a, b) => toMinutes(a.opens_time) - toMinutes(b.opens_time));
}

/** Rotates the week so it starts on `weekStart`. */
export function orderedDays(week: OpeningHoursWeek, weekStart: number): OpeningHoursDay[] {
  return Array.from({ length: DAYS_IN_WEEK }, (_, offset) => week[(weekStart + offset) % DAYS_IN_WEEK]).filter((day): day is OpeningHoursDay => day !== undefined);
}

function replaceDay(week: OpeningHoursWeek, next: OpeningHoursDay): OpeningHoursWeek {
  return week.map((day) => (day.day_of_week === next.day_of_week ? next : day));
}

export function setDayOpen(week: OpeningHoursWeek, day: Weekday, open: boolean): OpeningHoursWeek {
  if (!open) return replaceDay(week, closedDay(day));
  const current = week[day];
  const shifts = current && current.shifts.length > 0 ? current.shifts : [{ opens_time: DEFAULT_OPENS_TIME, closes_time: DEFAULT_CLOSES_TIME }];
  return replaceDay(week, { day_of_week: day, is_closed: false, shifts });
}

/** The next shift starts where the last one ends. Returns null when the day is full or has no room left. */
export function nextShift(day: OpeningHoursDay): Shift | null {
  if (day.shifts.length >= MAX_SHIFTS_PER_DAY) return null;
  const last = day.shifts[day.shifts.length - 1];
  const start = last ? toMinutes(last.closes_time) : toMinutes(DEFAULT_OPENS_TIME);
  if (start >= LAST_MINUTE_OF_DAY - MINUTES_PER_HOUR) return null;
  return { opens_time: toTime(start + MINUTES_PER_HOUR), closes_time: toTime(Math.min(start + MINUTES_PER_HOUR + NEW_SHIFT_MINUTES, LAST_MINUTE_OF_DAY)) };
}

export function canAddShift(day: OpeningHoursDay): boolean {
  return !day.is_closed && nextShift(day) !== null;
}

export function addShift(week: OpeningHoursWeek, day: Weekday): OpeningHoursWeek {
  const current = week[day];
  const shift = current ? nextShift(current) : null;
  if (!current || !shift) return week;
  return replaceDay(week, { ...current, shifts: [...current.shifts, shift] });
}

export function removeShift(week: OpeningHoursWeek, day: Weekday, index: number): OpeningHoursWeek {
  const current = week[day];
  if (!current) return week;
  const shifts = current.shifts.filter((_, position) => position !== index);
  return replaceDay(week, shifts.length === 0 ? closedDay(day) : { ...current, shifts });
}

export function updateShift(week: OpeningHoursWeek, day: Weekday, index: number, patch: Partial<Shift>): OpeningHoursWeek {
  const current = week[day];
  if (!current) return week;
  return replaceDay(week, { ...current, shifts: current.shifts.map((shift, position) => (position === index ? { ...shift, ...patch } : shift)) });
}

/** Copies one day's closed state and shifts onto the target days. */
export function copyDay(week: OpeningHoursWeek, from: Weekday, targets: readonly Weekday[]): OpeningHoursWeek {
  const source = week[from];
  if (!source) return week;
  return week.map((day) => (targets.includes(day.day_of_week) && day.day_of_week !== from ? { ...source, day_of_week: day.day_of_week, shifts: source.shifts.map((shift) => ({ ...shift })) } : day));
}

/** Problems the backend would reject, found before saving. Shifts are checked in the order shown. */
export function findIssues(week: OpeningHoursWeek): ShiftIssueEntry[] {
  const issues: ShiftIssueEntry[] = [];
  for (const day of week) {
    if (day.is_closed) continue;
    let previousEnd = -1;
    day.shifts.forEach((shift, index) => {
      const opens = toMinutes(shift.opens_time);
      const closes = toMinutes(shift.closes_time);
      if (closes <= opens) issues.push({ day: day.day_of_week, index, issue: ShiftIssue.Inverted });
      else if (opens < previousEnd) issues.push({ day: day.day_of_week, index, issue: ShiftIssue.Overlap });
      previousEnd = Math.max(previousEnd, closes);
    });
  }
  return issues;
}

/** The one array every problem-free day receives, so a memoized day row sees the same prop between renders. */
export const NO_ISSUES: readonly ShiftIssueEntry[] = Object.freeze([]);

/** Groups problems by day. A day without problems is absent; read it with `?? NO_ISSUES`. */
export function groupIssuesByDay(issues: readonly ShiftIssueEntry[]): ReadonlyMap<Weekday, readonly ShiftIssueEntry[]> {
  const byDay = new Map<Weekday, ShiftIssueEntry[]>();
  for (const entry of issues) {
    const group = byDay.get(entry.day);
    if (group) group.push(entry);
    else byDay.set(entry.day, [entry]);
  }
  return byDay;
}

export function weekToPayload(week: OpeningHoursWeek): OpeningHoursPayload {
  return {
    hours: week.map((day) =>
      day.is_closed ? { day_of_week: day.day_of_week, is_closed: true } : { day_of_week: day.day_of_week, shifts: sortShifts(day.shifts) },
    ),
  };
}

export function isSameWeek(a: OpeningHoursWeek, b: OpeningHoursWeek): boolean {
  return JSON.stringify(a) === JSON.stringify(b);
}

/** Position of a shift on a 24-hour track, as percentages of the track. */
export function shiftSegment(shift: Shift): { start: number; width: number } {
  const start = (toMinutes(shift.opens_time) / MINUTES_PER_DAY) * PERCENT;
  const end = (toMinutes(shift.closes_time) / MINUTES_PER_DAY) * PERCENT;
  return { start, width: Math.max(end - start, 0) };
}
