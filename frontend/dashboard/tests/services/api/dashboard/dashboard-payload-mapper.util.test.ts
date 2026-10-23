import {
  mapBranchPayload,
  mapChairPayload,
  mapBookingReschedulePayload,
  mapWalkInBookingPayload,
} from "@/services/api/dashboard/dashboard-payload-mapper.util";
import { describe, expect, it } from "vitest";

describe("dashboard payload mappers", () => {
  const branchInput = {
    name: { en: "Main", ar: "الرئيسي" },
    brandId: "b4e18cf2-6c48-41bb-857d-6db23f2cbaab",
    email: "branch@example.com",
    password: "long-enough-password",
    latitude: null,
    longitude: null,
    status: "enabled" as const,
    universe: "unisex" as const,
    description: { en: "Downtown", ar: null },
    address: { en: null, ar: null },
  };

  it("sends the storefront fields and only the configured opening days", () => {
    const payload = mapBranchPayload({
      ...branchInput,
      openingHours: [
        { weekday: 0, isClosed: false, opensAt: "09:00", closesAt: "17:00" },
        { weekday: 1, isClosed: false, opensAt: null, closesAt: null },
        { weekday: 5, isClosed: true, opensAt: "09:00", closesAt: "12:00" },
      ],
    });

    expect(payload.description).toEqual({ en: "Downtown", ar: null });
    expect(payload.opening_hours).toEqual([
      { weekday: 0, is_closed: false, opens_at: "09:00", closes_at: "17:00" },
      { weekday: 5, is_closed: true, opens_at: null, closes_at: null },
    ]);
  });

  it("omits opening_hours when no day is configured", () => {
    expect(mapBranchPayload(branchInput)).not.toHaveProperty("opening_hours");
  });

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

  it("adds force only when the maintenance conflict is confirmed", () => {
    const input = {
      label: "A1",
      branchId: "b4e18cf2-6c48-41bb-857d-6db23f2cbaab",
      barberId: null,
      floorZone: "shared" as const,
      status: "maintenance" as const,
      positionX: 0,
      positionY: 0,
      width: 1,
      height: 1,
      rotation: null,
    };
    expect(mapChairPayload(input)).not.toHaveProperty("force");
    expect(mapChairPayload(input, true)).toHaveProperty("force", true);
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
