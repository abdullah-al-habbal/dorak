import { describe, expect, it } from "vitest";
import {
  mapBooking,
  mapBranch,
} from "@/services/api/dashboard/dashboard-mapper.util";

const wireBooking = (client: unknown) => ({
  id: "booking-1",
  time_slot: "2026-10-22T10:00:00+00:00",
  ends_at: null,
  status: "completed",
  chair: null,
  barber: null,
  services: [],
  client,
});

describe("mapBooking", () => {
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
      wireBranch({ rating_avg: 4.33, rating_count: 3, universe: "women" }),
    );

    expect(branch.universe).toBe("women");

    expect(branch.ratingAvg).toBe(4.33);
    expect(branch.ratingCount).toBe(3);
  });

  it("maps an unrated branch to a null average and zero count", () => {
    const branch = mapBranch(wireBranch({ rating_avg: null, rating_count: 0 }));

    expect(branch.ratingAvg).toBeNull();
    expect(branch.ratingCount).toBe(0);
  });
});
