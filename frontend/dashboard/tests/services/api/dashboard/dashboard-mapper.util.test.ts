import { describe, expect, it } from "vitest";
import { mapBooking } from "@/services/api/dashboard/dashboard-mapper.util";

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
