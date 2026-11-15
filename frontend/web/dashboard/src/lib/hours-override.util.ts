import type { HoursOverrideInput } from "@/types/hours/hours-override.type";

export type SpecialDayKind = "closed" | "hours";

export interface SpecialDayDraft {
  date: string;
  kind: SpecialDayKind;
  opens: string;
  closes: string;
}

export type SpecialDayIssue = "date" | "past" | "times" | "order";

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
  if (draft.kind === "closed") return undefined;
  if (draft.opens === "" || draft.closes === "") return "times";
  return draft.closes > draft.opens ? undefined : "order";
}

export function specialDayInput(draft: SpecialDayDraft): HoursOverrideInput {
  return draft.kind === "closed" ? { is_closed: true } : { is_closed: false, opens_time: draft.opens, closes_time: draft.closes };
}
