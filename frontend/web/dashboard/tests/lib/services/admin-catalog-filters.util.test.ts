import { describe, expect, it } from "vitest";

import { ADMIN_CATALOG_MAX_SEARCH } from "@/config/admin-catalog.constant";
import { CatalogCategoryStatus } from "@/enums/catalog-category-status.enum";
import { adminCatalogFiltersFromParams, adminCatalogFiltersToParams, hasAdminCatalogFilters } from "@/lib/admin-catalog-filters.util";

describe("admin catalog filters", () => {
  it("lists every status by default and ignores an unknown one", () => {
    expect(adminCatalogFiltersFromParams(new URLSearchParams())).toEqual({ status: undefined, search: undefined });
    expect(adminCatalogFiltersFromParams(new URLSearchParams("status=archived")).status).toBeUndefined();
    expect(hasAdminCatalogFilters({})).toBe(false);
  });

  it("reads status and a trimmed, capped search", () => {
    const filters = adminCatalogFiltersFromParams(new URLSearchParams({ status: "inactive", search: `  ${"a".repeat(ADMIN_CATALOG_MAX_SEARCH + 5)} ` }));
    expect(filters.status).toBe(CatalogCategoryStatus.Inactive);
    expect(filters.search).toHaveLength(ADMIN_CATALOG_MAX_SEARCH);
    expect(hasAdminCatalogFilters(filters)).toBe(true);
  });

  it("writes only the filters that are set, and round-trips", () => {
    expect(adminCatalogFiltersToParams({}).toString()).toBe("");
    const params = adminCatalogFiltersToParams({ status: CatalogCategoryStatus.Active, search: "شعر" });
    expect(adminCatalogFiltersFromParams(params)).toEqual({ status: CatalogCategoryStatus.Active, search: "شعر" });
  });
});
