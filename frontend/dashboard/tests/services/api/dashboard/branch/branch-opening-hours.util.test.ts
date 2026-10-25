import { describe, expect, it } from "vitest";
import {
  fullWeek,
  openingHoursPayload,
} from "@/services/api/dashboard/branch/branch-opening-hours.util";

describe("fullWeek", () => {
  it("fills unconfigured days with empty open rows", () => {
    const week = fullWeek([
      { weekday: 3, isClosed: true, opensAt: null, closesAt: null },
    ]);

    expect(week).toHaveLength(7);
    expect(week[3]?.isClosed).toBe(true);
    expect(week[0]).toEqual({
      weekday: 0,
      isClosed: false,
      opensAt: null,
      closesAt: null,
    });
  });
});

describe("openingHoursPayload", () => {
  it("keeps closed days and days with both times", () => {
    expect(
      openingHoursPayload([
        { weekday: 0, isClosed: false, opensAt: "08:00", closesAt: "16:00" },
        { weekday: 1, isClosed: false, opensAt: "08:00", closesAt: null },
        { weekday: 2, isClosed: true, opensAt: "08:00", closesAt: "16:00" },
      ]),
    ).toEqual([
      { weekday: 0, is_closed: false, opens_at: "08:00", closes_at: "16:00" },
      { weekday: 2, is_closed: true, opens_at: null, closes_at: null },
    ]);
  });
});
