import type { ShiftIssue } from "@/enums/shift-issue.enum";
import type { Weekday } from "@/enums/weekday.enum";

export interface ShiftIssueEntry {
  day: Weekday;
  /** Index of the shift in the day's list as displayed. */
  index: number;
  issue: ShiftIssue;
}
