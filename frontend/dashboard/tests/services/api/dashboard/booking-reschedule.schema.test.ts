import { bookingRescheduleSchema } from "@/services/api/dashboard/booking-reschedule.schema";
import { describe, expect, it } from "vitest";

describe("bookingRescheduleSchema", () => {
  it("rejects a time range that ends before it starts", () => {
    expect(
      bookingRescheduleSchema.safeParse({
        timeSlot: "2026-01-01T12:00",
        endsAt: "2026-01-01T11:00",
      }).success,
    ).toBe(false);
  });
});
