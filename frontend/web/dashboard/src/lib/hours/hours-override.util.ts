import type { Weekday } from "@/enums/booking/weekday.enum";
import type { HoursOverrideInput, HoursOverrideRangeInput } from "@/types/hours/hours-override.type";

export type SpecialDayKind = "closed" | "hours";

export interface SpecialDayDraft {
  date: string;
  kind: SpecialDayKind;
  opens: string;
  closes: string;
  /** Last day of a range; empty means a single day. */
  endDate: string;
  /** A recurring closure: only these weekdays inside the range. Empty means every day. */
  weekdays: Weekday[];
}

export type SpecialDayIssue = "date" | "past" | "times" | "order" | "range" | "repeatNeedsEnd";

/** Local today as `YYYY-MM-DD`, the format a date input and the backend share. */
export function todayIso(now: Date = new Date()): string {
  const month = String(now.getMonth() + 1).padStart(2, "0");
  const day = String(now.getDate()).padStart(2, "0");
  return `${now.getFullYear()}-${month}-${day}`;
}

/** What is wrong with the draft, if anything. `HH:mm` strings compare correctly as text. */
export function specialDayIssue(draft: SpecialDayDraft, today: string = todayIso()): SpecialDayIssue | undefined {
  if (draft.date === "") return "date";
  if (draft.date < today) return "past";
  if (draft.endDate !== "" && draft.endDate < draft.date) return "range";
  if (draft.weekdays.length > 0 && draft.endDate === "") return "repeatNeedsEnd";
  if (draft.kind === "closed") return undefined;
  if (draft.opens === "" || draft.closes === "") return "times";
  return draft.closes > draft.opens ? undefined : "order";
}

export function specialDayInput(draft: SpecialDayDraft): HoursOverrideInput {
  return draft.kind === "closed" ? { is_closed: true } : { is_closed: false, opens_time: draft.opens, closes_time: draft.closes };
}

/** A range or a weekday filter goes through the range endpoint; a plain date keeps the single-day one. */
export function isRangeDraft(draft: SpecialDayDraft): boolean {
  return draft.endDate !== "" || draft.weekdays.length > 0;
}

export function specialDayRangeInput(draft: SpecialDayDraft): HoursOverrideRangeInput {
  const hours = specialDayInput(draft);
  return {
    date_from: draft.date,
    date_to: draft.endDate,
    ...(draft.weekdays.length > 0 ? { weekdays: draft.weekdays } : {}),
    ...hours,
  };
}
