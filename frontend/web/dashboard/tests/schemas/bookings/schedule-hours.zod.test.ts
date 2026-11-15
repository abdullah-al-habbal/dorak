import { describe, expect, it } from "vitest";

import { scheduleHoursListSchema } from "@/schemas/bookings/schedule-hours.zod";

describe("scheduleHoursListSchema", () => {
  it("accepts the backend rows", () => {
    const rows = [{ id: "a", day_of_week: 1, start_time: "09:00", end_time: "17:00", is_active: true }];
    expect(scheduleHoursListSchema.parse(rows)).toEqual(rows);
  });

  it("rejects an out-of-range weekday", () => {
    expect(scheduleHoursListSchema.safeParse([{ id: "a", day_of_week: 7, start_time: "09:00", end_time: "17:00", is_active: true }]).success).toBe(false);
  });
});
