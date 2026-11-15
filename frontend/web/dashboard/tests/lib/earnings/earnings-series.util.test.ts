import { describe, expect, it } from "vitest";

import { chartBuckets, dailyBuckets } from "@/lib/earnings-series.util";

const point = (date: string, gross: number, bookings: number, currency = "USD") => ({ date, currency_code: currency, gross_minor: gross, completed_bookings_count: bookings });

describe("dailyBuckets", () => {
  it("fills days without bookings with zero and ignores other currencies", () => {
    const buckets = dailyBuckets([point("2026-03-02", 500, 2), point("2026-03-02", 9999, 9, "EUR")], "USD", { from: "2026-03-01", to: "2026-03-03" });
    expect(buckets.map((bucket) => [bucket.start, bucket.gross_minor, bucket.bookings])).toEqual([
      ["2026-03-01", 0, 0],
      ["2026-03-02", 500, 2],
      ["2026-03-03", 0, 0],
    ]);
  });
});

describe("chartBuckets", () => {
  it("keeps daily bars for a short range", () => {
    expect(chartBuckets([], "USD", { from: "2026-03-01", to: "2026-03-31" })).toHaveLength(31);
  });

  it("groups a long range into weeks that keep the totals", () => {
    const range = { from: "2026-01-01", to: "2026-04-30" }; // 120 days
    const buckets = chartBuckets([point("2026-01-01", 100, 1), point("2026-01-07", 200, 2), point("2026-01-08", 400, 4)], "USD", range);
    expect(buckets).toHaveLength(18);
    expect(buckets[0]).toMatchObject({ start: "2026-01-01", end: "2026-01-07", gross_minor: 300, bookings: 3 });
    expect(buckets[1].gross_minor).toBe(400);
    expect(buckets.at(-1)?.end).toBe("2026-04-30");
    expect(buckets.reduce((sum, bucket) => sum + bucket.gross_minor, 0)).toBe(700);
  });
});
