import {
  mapChairPayload,
  mapBookingReschedulePayload,
  mapWalkInBookingPayload,
} from "@/services/api/dashboard/dashboard-payload-mapper.util";
import { describe, expect, it } from "vitest";

describe("dashboard payload mappers", () => {
  it("sends barber_id null when clearing a chair assignment", () => {
    expect(
      mapChairPayload({
        label: "A1",
        branchId: "b4e18cf2-6c48-41bb-857d-6db23f2cbaab",
        barberId: null,
        floorZone: "shared",
        status: "available",
        positionX: 0,
        positionY: 0,
        width: 1,
        height: 1,
        rotation: null,
      }).barber_id,
    ).toBeNull();
  });

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
