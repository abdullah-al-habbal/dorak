import {
  mapBookingReschedulePayload,
  mapWalkInBookingPayload,
} from "@/services/api/dashboard/dashboard-payload-mapper.util";
import { describe, expect, it } from "vitest";

describe("dashboard payload mappers", () => {
  it("maps camelCase walk-in input only at backend boundary", () => {
    expect(
      mapWalkInBookingPayload({
        branchId: "branch",
        chairId: "chair",
        barberId: null,
        customerName: "Customer",
        customerEmail: "customer@example.com",
        customerPhone: undefined,
        serviceIds: ["service"],
        timeSlot: "2026-01-01T12:00:00.000Z",
      }),
    ).toEqual({
      branch_id: "branch",
      chair_id: "chair",
      customer_email: "customer@example.com",
      customer_name: "Customer",
      service_ids: ["service"],
      time_slot: "2026-01-01T12:00:00.000Z",
    });
  });

  it("maps reschedule values to backend wire names", () => {
    expect(
      mapBookingReschedulePayload({
        timeSlot: "2026-01-01T12:00:00.000Z",
        endsAt: "2026-01-01T13:00:00.000Z",
      }),
    ).toEqual({
      time_slot: "2026-01-01T12:00:00.000Z",
      ends_at: "2026-01-01T13:00:00.000Z",
    });
  });
});
