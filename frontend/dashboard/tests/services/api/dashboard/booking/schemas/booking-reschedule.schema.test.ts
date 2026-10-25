import { en } from "@/i18n/messages/en.constant";
import { createBookingRescheduleSchema } from "@/services/api/dashboard/booking/schemas/booking-reschedule.schema";
import { describe, expect, it } from "vitest";

describe("bookingRescheduleSchema", () => {
  const schema = createBookingRescheduleSchema(en.validation);
  it("rejects a time range that ends before it starts", () => {
    expect(
      schema.safeParse({
        timeSlot: "2026-01-01T12:00",
        endsAt: "2026-01-01T11:00",
      }).success,
    ).toBe(false);
  });
});
