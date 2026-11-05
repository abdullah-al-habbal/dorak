import { describe, expect, it } from "vitest";
import {
  mapBooking,
  mapBookingStatusLog,
  mapBranch,
} from "@/services/api/dashboard/shared/dashboard-mapper.util";

const wireBooking = (client: unknown) => ({
  id: "booking-1",
  starts_at: "2026-10-22T10:00:00+00:00",
  ends_at: null,
  status: "completed",
  chair: null,
  barber: null,
  services: [],
  client,
});

describe("mapBookingStatusLog", () => {
  it("maps a transition entry", () => {
    expect(
      mapBookingStatusLog({
        id: "log-1",
        from_status: "pending",
        to_status: "confirmed",
        actor_type: "admin",
        actor_id: "admin-1",
        reason: null,
        created_at: "2026-10-26T10:00:00+00:00",
      }),
    ).toEqual({
      id: "log-1",
      fromStatus: "pending",
      toStatus: "confirmed",
      actorType: "admin",
      actorId: "admin-1",
      reason: null,
      createdAt: "2026-10-26T10:00:00+00:00",
    });
  });

  it("keeps a creation entry's null from-status and a system actor's null id", () => {
    expect(
      mapBookingStatusLog({
        id: "log-2",
        from_status: null,
        to_status: "pending",
        actor_type: "system",
        actor_id: null,
        reason: "chair_maintenance",
        created_at: null,
      }),
    ).toEqual({
      id: "log-2",
      fromStatus: null,
      toStatus: "pending",
      actorType: "system",
      actorId: null,
      reason: "chair_maintenance",
      createdAt: null,
    });
  });
});

describe("mapBooking", () => {
  it("reads booking_status and starts_at from the wire", () => {
    const booking = mapBooking({
      id: "b1",
      booking_status: "cancelled",
      starts_at: "2026-11-02T10:00:00Z",
    });
    expect(booking.status).toBe("cancelled");
    expect(booking.startsAt).toBe("2026-11-02T10:00:00Z");
  });

  it("maps the client and their reputation", () => {
    expect(
      mapBooking(
        wireBooking({
          id: "client-1",
          name: { en: "Sara", ar: "سارة" },
          reputation: { average: 3.5, count: 2 },
        }),
      ).client,
    ).toEqual({ name: "Sara", reputation: { average: 3.5, count: 2 } });
  });

  it("keeps an unrated client's average null", () => {
    expect(
      mapBooking(
        wireBooking({
          id: "client-1",
          name: "Sara",
          reputation: { average: null, count: 0 },
        }),
      ).client?.reputation,
    ).toEqual({ average: null, count: 0 });
  });

  it("maps a booking without a client payload to null", () => {
    expect(mapBooking(wireBooking(undefined)).client).toBeNull();
  });
});

describe("mapBranch", () => {
  const wireBranch = (rating: Record<string, unknown>) => ({
    id: "branch-1",
    brand_id: "brand-1",
    email: "b@example.test",
    name: { en: "Downtown", ar: "وسط" },
    status: "enabled",
    latitude: null,
    longitude: null,
    ...rating,
  });

  it("maps the stored rating aggregate and universe", () => {
    const branch = mapBranch(
      wireBranch({ rating_average: 4.33, rating_count: 3, universe: "women" }),
    );

    expect(branch.universe).toBe("women");

    expect(branch.ratingAverage).toBe(4.33);
    expect(branch.ratingCount).toBe(3);
  });

  it("maps the storefront fields and trims stored hour times", () => {
    const branch = mapBranch(
      wireBranch({
        description: { en: "Downtown shop", ar: "محل وسط البلد" },
        address: { en: "Main St", ar: "الشارع الرئيسي" },
        tags: ["kids"],
        opening_hours: [
          {
            day_of_week: 1,
            opens_time: "09:00:00",
            closes_time: "17:30:00",
            is_closed: false,
          },
          {
            day_of_week: 5,
            opens_time: null,
            closes_time: null,
            is_closed: true,
          },
        ],
      }),
    );

    expect(branch.description.ar).toBe("محل وسط البلد");
    expect(branch.address.en).toBe("Main St");
    expect(branch.tags).toEqual(["kids"]);
    expect(branch.openingHours).toEqual([
      {
        dayOfWeek: 1,
        isClosed: false,
        opensTime: "09:00",
        closesTime: "17:30",
      },
      { dayOfWeek: 5, isClosed: true, opensTime: null, closesTime: null },
    ]);
  });

  it("maps an unrated branch to a null average and zero count", () => {
    const branch = mapBranch(
      wireBranch({ rating_average: null, rating_count: 0 }),
    );

    expect(branch.ratingAverage).toBeNull();
    expect(branch.ratingCount).toBe(0);
  });
});
