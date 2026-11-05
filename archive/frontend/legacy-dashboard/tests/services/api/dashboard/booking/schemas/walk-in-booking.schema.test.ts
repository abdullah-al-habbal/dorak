import { en } from "@/i18n/messages/en.constant";
import { createWalkInBookingSchema } from "@/services/api/dashboard/booking/schemas/walk-in-booking.schema";
import { describe, expect, it } from "vitest";

describe("walkInBookingSchema", () => {
  const schema = createWalkInBookingSchema(en.validation);
  it("requires at least one service", () => {
    expect(
      schema.safeParse({
        branchId: "b4e18cf2-6c48-41bb-857d-6db23f2cbaab",
        chairId: "b4e18cf2-6c48-41bb-857d-6db23f2cbaab",
        barberId: null,
        customerName: "Customer",
        customerEmail: "customer@example.com",
        serviceIds: [],
        startsAt: "2026-01-01T12:00",
      }).success,
    ).toBe(false);
  });
});
