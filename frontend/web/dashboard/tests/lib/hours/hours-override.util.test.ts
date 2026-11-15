import { describe, expect, it } from "vitest";

import { specialDayInput, specialDayIssue, todayIso } from "@/lib/hours-override.util";
import type { SpecialDayDraft } from "@/lib/hours-override.util";

const today = "2026-11-14";
const hours: SpecialDayDraft = { date: "2026-11-20", kind: "hours", opens: "10:00", closes: "18:00" };

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
    expect(specialDayIssue({ date: "2026-11-20", kind: "closed", opens: "", closes: "" }, today)).toBeUndefined();
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
});
