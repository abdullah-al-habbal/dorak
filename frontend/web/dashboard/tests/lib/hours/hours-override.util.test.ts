import { describe, expect, it } from "vitest";

import { isRangeDraft, mapSpecialDayFieldName, specialDayInput, specialDayIssue, specialDayRangeInput, todayIso } from "@/lib/hours/hours-override.util";
import type { SpecialDayDraft } from "@/lib/hours/hours-override.util";

const today = "2026-11-14";
const hours: SpecialDayDraft = { date: "2026-11-20", kind: "hours", opens: "10:00", closes: "18:00", endDate: "", weekdays: [] };

describe("special day helpers", () => {
  it("formats the local date for a date input", () => {
    expect(todayIso(new Date(2026, 0, 5))).toBe("2026-01-05");
    expect(todayIso(new Date(2026, 11, 31))).toBe("2026-12-31");
  });

  it("flags a missing or past date", () => {
    expect(specialDayIssue({ ...hours, date: "" }, today)).toBe("date");
    expect(specialDayIssue({ ...hours, date: "2026-11-13" }, today)).toBe("past");
    expect(specialDayIssue({ ...hours, date: today }, today)).toBeUndefined();
  });

  it("needs no times for a closed day", () => {
    expect(specialDayIssue({ date: "2026-11-20", kind: "closed", opens: "", closes: "", endDate: "", weekdays: [] }, today)).toBeUndefined();
  });

  it("needs both times, with closing after opening", () => {
    expect(specialDayIssue({ ...hours, opens: "" }, today)).toBe("times");
    expect(specialDayIssue({ ...hours, closes: "" }, today)).toBe("times");
    expect(specialDayIssue({ ...hours, closes: "10:00" }, today)).toBe("order");
    expect(specialDayIssue({ ...hours, closes: "09:00" }, today)).toBe("order");
    expect(specialDayIssue(hours, today)).toBeUndefined();
  });

  it("builds the request body", () => {
    expect(specialDayInput({ ...hours, kind: "closed" })).toEqual({ is_closed: true });
    expect(specialDayInput(hours)).toEqual({ is_closed: false, opens_time: "10:00", closes_time: "18:00" });
  });

  it("flags a last day before the first day and weekdays without a last day", () => {
    expect(specialDayIssue({ ...hours, endDate: "2026-11-19" }, today)).toBe("range");
    expect(specialDayIssue({ ...hours, weekdays: [5] }, today)).toBe("repeatNeedsEnd");
    expect(specialDayIssue({ ...hours, endDate: "2026-12-20", weekdays: [5] }, today)).toBeUndefined();
  });

  it("sends a range or a weekday filter through the range payload only", () => {
    expect(isRangeDraft(hours)).toBe(false);
    const range: SpecialDayDraft = { ...hours, endDate: "2026-12-20", weekdays: [5] };
    expect(isRangeDraft(range)).toBe(true);
    expect(specialDayRangeInput(range)).toEqual({ date_from: "2026-11-20", date_to: "2026-12-20", weekdays: [5], is_closed: false, opens_time: "10:00", closes_time: "18:00" });
    expect(specialDayRangeInput({ ...range, kind: "closed", weekdays: [] })).toEqual({ date_from: "2026-11-20", date_to: "2026-12-20", is_closed: true });
  });
});

describe("special day field names", () => {
  it("maps backend names onto form fields", () => {
    expect(mapSpecialDayFieldName("date_to")).toBe("endDate");
    expect(mapSpecialDayFieldName("opens_time")).toBe("opens");
    expect(mapSpecialDayFieldName("other")).toBe("root");
  });
});
