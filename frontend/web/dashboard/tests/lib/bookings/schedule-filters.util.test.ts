import { describe, expect, it } from "vitest";

import { BookingStatus } from "@/enums/booking-status.enum";
import { ScheduleRange } from "@/enums/schedule-range.enum";
import { scheduleFiltersFromParams, scheduleFiltersToParams, scheduleWindow } from "@/lib/bookings/schedule-filters.util";

describe("schedule filters", () => {
  it("defaults to the upcoming range and page 1", () => {
    expect(scheduleFiltersFromParams(new URLSearchParams(""))).toEqual({ range: ScheduleRange.Upcoming, status: undefined, page: 1 });
  });

  it("parses a valid range, status and page", () => {
    expect(scheduleFiltersFromParams(new URLSearchParams("range=week&status=confirmed&page=3"))).toEqual({
      range: ScheduleRange.Week,
      status: BookingStatus.Confirmed,
      page: 3,
    });
  });

  it("falls back on unknown values", () => {
    expect(scheduleFiltersFromParams(new URLSearchParams("range=forever&status=nope&page=-2"))).toEqual({
      range: ScheduleRange.Upcoming,
      status: undefined,
      page: 1,
    });
  });

  it("round-trips and keeps defaults out of the URL", () => {
    expect(scheduleFiltersToParams({ range: ScheduleRange.Upcoming, page: 1 }).toString()).toBe("");
    const filters = { range: ScheduleRange.Today, status: BookingStatus.Pending, page: 2 };
    expect(scheduleFiltersFromParams(scheduleFiltersToParams(filters))).toEqual(filters);
  });
});

describe("schedule window", () => {
  // Wednesday 2026-11-11, local time.
  const wednesday = new Date(2026, 10, 11, 15, 30);

  it("is a single day for today", () => {
    expect(scheduleWindow(ScheduleRange.Today, wednesday, 0)).toEqual({ from: "2026-11-11", to: "2026-11-11" });
  });

  it("is open-ended from today for upcoming", () => {
    expect(scheduleWindow(ScheduleRange.Upcoming, wednesday, 0)).toEqual({ from: "2026-11-11" });
  });

  it("spans seven days from the locale week start", () => {
    expect(scheduleWindow(ScheduleRange.Week, wednesday, 0)).toEqual({ from: "2026-11-08", to: "2026-11-14" });
    expect(scheduleWindow(ScheduleRange.Week, wednesday, 1)).toEqual({ from: "2026-11-09", to: "2026-11-15" });
    expect(scheduleWindow(ScheduleRange.Week, wednesday, 6)).toEqual({ from: "2026-11-07", to: "2026-11-13" });
  });

  it("crosses a month boundary", () => {
    expect(scheduleWindow(ScheduleRange.Week, new Date(2026, 11, 2), 1)).toEqual({ from: "2026-11-30", to: "2026-12-06" });
  });
});
