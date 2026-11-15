import { describe, expect, it } from "vitest";

import { ratingBars } from "@/lib/clients/review-summary.util";

describe("ratingBars", () => {
  it("lists ratings 5 to 1 with rounded percentages", () => {
    const bars = ratingBars({ average: 3.67, count: 3, distribution: { "5": 1, "4": 1, "2": 1 } });
    expect(bars.map((bar) => bar.rating)).toEqual([5, 4, 3, 2, 1]);
    expect(bars.map((bar) => bar.count)).toEqual([1, 1, 0, 1, 0]);
    expect(bars[0]?.percent).toBe(33);
  });

  it("returns empty bars when nothing is counted", () => {
    const bars = ratingBars({ average: null, count: 0, distribution: {} });
    expect(bars.every((bar) => bar.count === 0 && bar.percent === 0)).toBe(true);
  });
});
