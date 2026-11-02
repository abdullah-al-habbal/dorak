import { describe, expect, it } from "vitest";
import { fullWeek } from "@/services/api/dashboard/branch/branch-opening-hours.util";
import { openingHoursPayload } from "@/services/api/dashboard/branch/branch-opening-hours.mapper.util";

describe("fullWeek", () => {
  it("fills unconfigured days with empty open rows", () => {
    const week = fullWeek([
      { dayOfWeek: 3, isClosed: true, opensTime: null, closesTime: null },
    ]);

    expect(week).toHaveLength(7);
    expect(week[3]?.isClosed).toBe(true);
    expect(week[0]).toEqual({
      dayOfWeek: 0,
      isClosed: false,
      opensTime: null,
      closesTime: null,
    });
  });
});

describe("openingHoursPayload", () => {
  it("keeps closed days and days with both times", () => {
    expect(
      openingHoursPayload([
        {
          dayOfWeek: 0,
          isClosed: false,
          opensTime: "08:00",
          closesTime: "16:00",
        },
        { dayOfWeek: 1, isClosed: false, opensTime: "08:00", closesTime: null },
        {
          dayOfWeek: 2,
          isClosed: true,
          opensTime: "08:00",
          closesTime: "16:00",
        },
      ]),
    ).toEqual([
      {
        day_of_week: 0,
        is_closed: false,
        opens_time: "08:00",
        closes_time: "16:00",
      },
      { day_of_week: 2, is_closed: true, opens_time: null, closes_time: null },
    ]);
  });
});
