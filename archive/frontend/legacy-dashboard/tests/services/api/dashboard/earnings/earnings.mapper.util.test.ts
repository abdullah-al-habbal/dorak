import { describe, expect, it } from "vitest";
import { mapEarnings } from "@/services/api/dashboard/earnings/earnings.mapper.util";

describe("mapEarnings", () => {
  it("maps owner totals with commission and net", () => {
    expect(
      mapEarnings({
        scope: "brand",
        totals: [
          {
            currency_code: "JOD",
            gross_minor: 15000,
            commission_minor: 1500,
            net_minor: 13500,
            completed_bookings_count: 2,
          },
        ],
      }),
    ).toEqual({
      scope: "brand",
      totals: [
        {
          currencyCode: "JOD",
          grossMinor: 15000,
          commissionMinor: 1500,
          netMinor: 13500,
          completedBookingsCount: 2,
        },
      ],
    });
  });

  it("keeps a stylist's net pay null without commission fields", () => {
    const [total] = mapEarnings({
      scope: "barber",
      totals: [
        {
          currency_code: "JOD",
          gross_minor: 10000,
          net_minor: null,
          completed_bookings_count: 1,
        },
      ],
    }).totals;

    expect(total?.commissionMinor).toBeNull();
    expect(total?.netMinor).toBeNull();
  });

  it("rejects an unknown scope", () => {
    expect(() => mapEarnings({ scope: "admin", totals: [] })).toThrow();
  });
});
