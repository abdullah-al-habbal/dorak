import { describe, expect, it } from "vitest";

import { ChairStatus } from "@/enums/chair-status.enum";
import { withChairStatus } from "@/lib/chairs/chair-cache.util";
import type { ChairPage } from "@/types/chairs/chair-page.type";

const page: ChairPage = {
  items: [
    { id: "a", status: ChairStatus.Available, configured_status: ChairStatus.Available },
    { id: "b", status: ChairStatus.Available, configured_status: ChairStatus.Available },
  ],
  page: { total: 2, per_page: 20, current_page: 1, total_pages: 1 },
};

describe("withChairStatus", () => {
  it("replaces only the matching chair", () => {
    const next = withChairStatus(page, "b", ChairStatus.Maintenance);
    expect(next?.items.map((chair) => chair.configured_status)).toEqual([ChairStatus.Available, ChairStatus.Maintenance]);
  });

  it("returns pages without the chair, and undefined, untouched", () => {
    expect(withChairStatus(page, "zzz", ChairStatus.Maintenance)).toBe(page);
    expect(withChairStatus(undefined, "a", ChairStatus.Maintenance)).toBeUndefined();
  });
});
