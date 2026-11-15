import { describe, expect, it } from "vitest";

import { PayoutStatus } from "@/enums/money/payout-status.enum";
import { payoutFiltersFromParams, payoutFiltersToParams } from "@/lib/earnings/payout-filters.util";

describe("payout filters", () => {
  it("parses a known status and page", () => {
    expect(payoutFiltersFromParams(new URLSearchParams("status=paid&page=3"))).toEqual({ status: PayoutStatus.Paid, page: 3 });
  });

  it("drops an unknown status and a bad page", () => {
    expect(payoutFiltersFromParams(new URLSearchParams("status=bogus&page=-2"))).toEqual({ status: undefined, page: 1 });
  });

  it("omits defaults when writing the URL", () => {
    expect(payoutFiltersToParams({ page: 1 }).toString()).toBe("");
    expect(payoutFiltersToParams({ status: PayoutStatus.Approved, page: 2 }).toString()).toBe("status=approved&page=2");
  });
});
