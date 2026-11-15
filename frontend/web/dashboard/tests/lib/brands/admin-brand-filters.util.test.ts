import { describe, expect, it } from "vitest";

import { ADMIN_BRAND_MAX_SEARCH, BRAND_STATUS_FILTER_ALL } from "@/config/platform/admin-brand.constant";
import { BrandStatus } from "@/enums/venue/brand-status.enum";
import { adminBrandFiltersFromParams, adminBrandFiltersToParams, adminBrandQueryString, hasAdminBrandFilters } from "@/lib/brands/admin-brand-filters.util";

describe("admin brand filters", () => {
  it("opens the pending queue on a bare or unknown status", () => {
    expect(adminBrandFiltersFromParams(new URLSearchParams())).toEqual({ status: BrandStatus.Pending, search: undefined, page: 1 });
    expect(adminBrandFiltersFromParams(new URLSearchParams("status=bogus&page=-2")).status).toBe(BrandStatus.Pending);
  });

  it("reads every status, the search and the page", () => {
    expect(adminBrandFiltersFromParams(new URLSearchParams("status=all&search=%20Cuts%20&page=3"))).toEqual({ status: BRAND_STATUS_FILTER_ALL, search: "Cuts", page: 3 });
    expect(adminBrandFiltersFromParams(new URLSearchParams("status=active")).status).toBe(BrandStatus.Active);
    expect(adminBrandFiltersFromParams(new URLSearchParams(`search=${"x".repeat(ADMIN_BRAND_MAX_SEARCH + 5)}`)).search).toHaveLength(ADMIN_BRAND_MAX_SEARCH);
  });

  it("keeps the default out of the URL and round-trips the rest", () => {
    expect(adminBrandFiltersToParams({ status: BrandStatus.Pending, page: 1 }).toString()).toBe("");
    const params = adminBrandFiltersToParams({ status: BRAND_STATUS_FILTER_ALL, search: "Cuts", page: 2 });
    expect(params.toString()).toBe("status=all&search=Cuts&page=2");
    expect(adminBrandFiltersFromParams(params)).toEqual({ status: BRAND_STATUS_FILTER_ALL, search: "Cuts", page: 2 });
  });

  it("sends no status to the backend for 'all'", () => {
    expect(adminBrandQueryString({ status: BRAND_STATUS_FILTER_ALL, page: 1 }, 10)).toBe("per_page=10&page=1");
    expect(adminBrandQueryString({ status: BrandStatus.Pending, search: "a b", page: 2 }, 10)).toBe("per_page=10&page=2&status=pending&search=a+b");
  });

  it("treats only the pending queue without a search as unfiltered", () => {
    expect(hasAdminBrandFilters({ status: BrandStatus.Pending, page: 1 })).toBe(false);
    expect(hasAdminBrandFilters({ status: BrandStatus.Pending, search: "x", page: 1 })).toBe(true);
    expect(hasAdminBrandFilters({ status: BRAND_STATUS_FILTER_ALL, page: 1 })).toBe(true);
  });
});
