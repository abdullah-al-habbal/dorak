import { describe, expect, it } from "vitest";

import { ShiftIssue } from "@/enums/shift-issue.enum";
import { Weekday } from "@/enums/weekday.enum";
import type { OpeningHoursDay } from "@/interfaces/opening-hours-day.interface";
import {
  addShift,
  canAddShift,
  copyDay,
  findIssues,
  isSameWeek,
  nextShift,
  orderedDays,
  removeShift,
  setDayOpen,
  shiftSegment,
  updateShift,
  weekFromServer,
  weekToPayload,
} from "@/lib/opening-hours.util";

const monday: OpeningHoursDay = {
  day_of_week: Weekday.Monday,
  is_closed: false,
  shifts: [
    { opens_time: "16:00", closes_time: "22:00" },
    { opens_time: "09:00", closes_time: "13:00" },
  ],
};

describe("weekFromServer", () => {
  it("fills missing days as closed and sorts shifts", () => {
    const week = weekFromServer([monday]);
    expect(week).toHaveLength(7);
    expect(week[Weekday.Sunday]?.is_closed).toBe(true);
    expect(week[Weekday.Monday]?.shifts.map((s) => s.opens_time)).toEqual(["09:00", "16:00"]);
  });

  it("treats an open day without shifts as closed", () => {
    const week = weekFromServer([{ day_of_week: Weekday.Tuesday, is_closed: false, shifts: [] }]);
    expect(week[Weekday.Tuesday]?.is_closed).toBe(true);
  });
});

describe("orderedDays", () => {
  it("starts the week on the given day", () => {
    const order = orderedDays(weekFromServer([]), Weekday.Saturday).map((d) => d.day_of_week);
    expect(order).toEqual([6, 0, 1, 2, 3, 4, 5]);
  });
});

describe("editing", () => {
  it("opens a closed day with a default shift and closing clears shifts", () => {
    const opened = setDayOpen(weekFromServer([]), Weekday.Friday, true);
    expect(opened[Weekday.Friday]?.shifts).toEqual([{ opens_time: "09:00", closes_time: "17:00" }]);
    expect(setDayOpen(opened, Weekday.Friday, false)[Weekday.Friday]?.shifts).toEqual([]);
  });

  it("adds a shift after the last one and stops at the limit", () => {
    let week = setDayOpen(weekFromServer([]), Weekday.Monday, true);
    week = addShift(week, Weekday.Monday);
    expect(week[Weekday.Monday]?.shifts[1]).toEqual({ opens_time: "18:00", closes_time: "20:00" });
    week = addShift(addShift(week, Weekday.Monday), Weekday.Monday);
    expect(week[Weekday.Monday]?.shifts.length).toBeLessThanOrEqual(4);
    expect(addShift(week, Weekday.Monday)).toBe(week);
  });

  it("refuses a new shift when the day has no room left", () => {
    const late: OpeningHoursDay = { day_of_week: Weekday.Monday, is_closed: false, shifts: [{ opens_time: "20:00", closes_time: "23:30" }] };
    expect(nextShift(late)).toBeNull();
    expect(canAddShift(late)).toBe(false);
  });

  it("removing the last shift closes the day", () => {
    const week = setDayOpen(weekFromServer([]), Weekday.Monday, true);
    expect(removeShift(week, Weekday.Monday, 0)[Weekday.Monday]?.is_closed).toBe(true);
  });

  it("updates one shift without touching the rest", () => {
    const week = weekFromServer([monday]);
    const next = updateShift(week, Weekday.Monday, 0, { closes_time: "12:00" });
    expect(next[Weekday.Monday]?.shifts[0]?.closes_time).toBe("12:00");
    expect(next[Weekday.Monday]?.shifts[1]).toEqual(week[Weekday.Monday]?.shifts[1]);
  });

  it("copies a day to others without sharing shift objects", () => {
    const week = weekFromServer([monday]);
    const copied = copyDay(week, Weekday.Monday, [Weekday.Tuesday, Weekday.Wednesday, Weekday.Monday]);
    expect(copied[Weekday.Tuesday]?.shifts).toEqual(week[Weekday.Monday]?.shifts);
    expect(copied[Weekday.Tuesday]?.shifts[0]).not.toBe(week[Weekday.Monday]?.shifts[0]);
    expect(copied[Weekday.Thursday]?.is_closed).toBe(true);
  });
});

describe("findIssues", () => {
  it("flags inverted and overlapping shifts and accepts back-to-back ones", () => {
    const day = (shifts: OpeningHoursDay["shifts"]) => [{ day_of_week: Weekday.Monday, is_closed: false, shifts }];
    expect(findIssues(day([{ opens_time: "13:00", closes_time: "09:00" }]))).toEqual([{ day: 1, index: 0, issue: ShiftIssue.Inverted }]);
    expect(findIssues(day([{ opens_time: "09:00", closes_time: "13:00" }, { opens_time: "12:00", closes_time: "15:00" }]))).toEqual([{ day: 1, index: 1, issue: ShiftIssue.Overlap }]);
    expect(findIssues(day([{ opens_time: "09:00", closes_time: "12:00" }, { opens_time: "12:00", closes_time: "15:00" }]))).toEqual([]);
  });
});

describe("payload and comparison", () => {
  it("sends closed days as is_closed and open days as sorted shifts", () => {
    const payload = weekToPayload(weekFromServer([monday]));
    expect(payload.hours).toHaveLength(7);
    expect(payload.hours[0]).toEqual({ day_of_week: 0, is_closed: true });
    expect(payload.hours[1]).toEqual({ day_of_week: 1, shifts: [{ opens_time: "09:00", closes_time: "13:00" }, { opens_time: "16:00", closes_time: "22:00" }] });
  });

  it("detects equal and changed weeks", () => {
    const week = weekFromServer([monday]);
    expect(isSameWeek(week, weekFromServer([monday]))).toBe(true);
    expect(isSameWeek(week, setDayOpen(week, Weekday.Monday, false))).toBe(false);
  });

  it("places a shift on the 24-hour track", () => {
    expect(shiftSegment({ opens_time: "06:00", closes_time: "12:00" })).toEqual({ start: 25, width: 25 });
  });
});
