import { describe, expect, it } from "vitest";

import { Weekday } from "@/enums/weekday.enum";
import { formatClock, scheduleWeek } from "@/lib/schedule-hours.util";
import type { ScheduleHoursRow } from "@/types/bookings/schedule-hours-row.type";

const row = (day_of_week: number, start_time: string, end_time: string, is_active = true): ScheduleHoursRow => ({
  id: `${day_of_week}-${start_time}`,
  day_of_week,
  start_time,
  end_time,
  is_active,
});

describe("scheduleWeek", () => {
  it("returns seven days starting at the week start", () => {
    expect(scheduleWeek([], 6).map((entry) => entry.day)).toEqual([6, 0, 1, 2, 3, 4, 5]);
    expect(scheduleWeek([], 0)).toHaveLength(7);
  });

  it("leaves days without rows or with inactive rows empty (a day off)", () => {
    const week = scheduleWeek([row(1, "09:00", "13:00", false)], 0);
    expect(week.every((entry) => entry.shifts.length === 0)).toBe(true);
  });

  it("collects several shifts of a day in time order", () => {
    const week = scheduleWeek([row(3, "14:00", "18:00"), row(3, "09:00", "12:00"), row(2, "10:00", "16:00")], 0);
    const wednesday = week.find((entry) => entry.day === Weekday.Wednesday);
    expect(wednesday?.shifts).toEqual([
      { start: "09:00", end: "12:00" },
      { start: "14:00", end: "18:00" },
    ]);
    expect(week.find((entry) => entry.day === Weekday.Tuesday)?.shifts).toHaveLength(1);
  });
});

describe("formatClock", () => {
  it("formats HH:mm for the locale", () => {
    expect(formatClock("09:05", "en")).toMatch(/9:05/);
    expect(formatClock("14:30", "ar")).toMatch(/2:30\s*م/);
  });

  it("returns unparseable text unchanged", () => {
    expect(formatClock("soon", "en")).toBe("soon");
  });
});
