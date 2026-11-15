import { describe, expect, it } from "vitest";

import { BarberStatus } from "@/enums/barber-status.enum";
import { withStylistStatus } from "@/lib/stylists/stylist-cache.util";
import type { StylistPage } from "@/types/stylists/stylist-page.type";

const PAGE: StylistPage = {
  items: [
    { id: "a", name: "A", status: BarberStatus.Enabled, rating_count: 0 },
    { id: "b", name: "B", status: BarberStatus.Pending, rating_count: 0 },
  ],
  page: { total: 2, per_page: 20, current_page: 1, total_pages: 1 },
};

describe("withStylistStatus", () => {
  it("replaces only the matching stylist without mutating the input", () => {
    const next = withStylistStatus(PAGE, "a", BarberStatus.Disabled);
    expect(next?.items.map((item) => item.status)).toEqual([BarberStatus.Disabled, BarberStatus.Pending]);
    expect(PAGE.items[0].status).toBe(BarberStatus.Enabled);
  });

  it("returns the same page when the stylist is not in it", () => {
    expect(withStylistStatus(PAGE, "zzz", BarberStatus.Enabled)).toBe(PAGE);
    expect(withStylistStatus(undefined, "a", BarberStatus.Enabled)).toBeUndefined();
  });
});
