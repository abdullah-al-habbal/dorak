import { describe, expect, it } from "vitest";

import { AdminUserState } from "@/enums/admin-user-state.enum";
import { BarberStatus } from "@/enums/barber-status.enum";
import { ClientBanFilter } from "@/enums/client-ban-filter.enum";
import { ClientStatus } from "@/enums/client-status.enum";
import { ReviewStatus } from "@/enums/review-status.enum";
import { adminUserFiltersFromParams, adminUserFiltersToParams, adminUserQueryString, hasAdminUserFilters } from "@/lib/platform/admin-user-filters.util";
import { barberApprovalFiltersFromParams, barberApprovalFiltersToParams, barberApprovalQueryString, hasBarberApprovalFilters } from "@/lib/stylists/barber-approval-filters.util";
import { clientFiltersFromParams, clientFiltersToParams, clientQueryString, hasClientFilters } from "@/lib/clients/client-filters.util";
import { reviewModerationFiltersFromParams, reviewModerationFiltersToParams, reviewModerationQueryString } from "@/lib/clients/review-moderation-filters.util";

const params = (query: string): URLSearchParams => new URLSearchParams(query);

describe("client filters", () => {
  it("defaults on unknown values and bad pages", () => {
    expect(clientFiltersFromParams(params("status=zzz&banned=zzz&page=-2"))).toEqual({ status: "all", banned: ClientBanFilter.All, search: undefined, page: 1 });
    expect(clientFiltersFromParams(params("page=2.5")).page).toBe(1);
  });

  it("trims and caps the search", () => {
    expect(clientFiltersFromParams(params(`search=${encodeURIComponent("  sam  ")}`)).search).toBe("sam");
    expect(clientFiltersFromParams(params(`search=${"x".repeat(150)}`)).search).toHaveLength(100);
    expect(clientFiltersFromParams(params("search=%20")).search).toBeUndefined();
  });

  it("round-trips through the URL and omits defaults", () => {
    const filters = { status: ClientStatus.Enabled, banned: ClientBanFilter.Banned, search: "sam", page: 3 };
    expect(clientFiltersFromParams(clientFiltersToParams(filters))).toEqual(filters);
    expect(clientFiltersToParams({ status: "all", banned: ClientBanFilter.All, page: 1 }).toString()).toBe("");
  });

  it("builds the backend query: all sends no status, ban becomes 1 or 0", () => {
    expect(clientQueryString({ status: "all", banned: ClientBanFilter.All, page: 1 }, 20)).toBe("per_page=20&page=1");
    expect(clientQueryString({ status: ClientStatus.Pending, banned: ClientBanFilter.Banned, search: "a b", page: 2 }, 20)).toBe("per_page=20&page=2&status=pending&banned=1&search=a+b");
    expect(clientQueryString({ status: "all", banned: ClientBanFilter.NotBanned, page: 1 }, 5)).toContain("banned=0");
  });

  it("knows when a filter is active", () => {
    expect(hasClientFilters({ status: "all", banned: ClientBanFilter.All, page: 4 })).toBe(false);
    expect(hasClientFilters({ status: "all", banned: ClientBanFilter.All, search: "x", page: 1 })).toBe(true);
    expect(hasClientFilters({ status: ClientStatus.Disabled, banned: ClientBanFilter.All, page: 1 })).toBe(true);
  });
});

describe("barber approval filters", () => {
  it("opens the pending queue by default and accepts all", () => {
    expect(barberApprovalFiltersFromParams(params("")).status).toBe(BarberStatus.Pending);
    expect(barberApprovalFiltersFromParams(params("status=nope")).status).toBe(BarberStatus.Pending);
    expect(barberApprovalFiltersFromParams(params("status=all")).status).toBe("all");
    expect(barberApprovalFiltersFromParams(params("status=rejected")).status).toBe(BarberStatus.Rejected);
  });

  it("omits the default status from the URL and keeps it in the API query", () => {
    const pending = { status: BarberStatus.Pending, page: 1 } as const;
    expect(barberApprovalFiltersToParams(pending).toString()).toBe("");
    expect(barberApprovalQueryString(pending, 10)).toBe("per_page=10&page=1&status=pending");
    expect(barberApprovalQueryString({ status: "all", page: 2, search: "ali" }, 10)).toBe("per_page=10&page=2&search=ali");
  });

  it("round-trips and reports active filters", () => {
    const filters = { status: BarberStatus.Enabled, search: "ali", page: 2 } as const;
    expect(barberApprovalFiltersFromParams(barberApprovalFiltersToParams(filters))).toEqual(filters);
    expect(hasBarberApprovalFilters({ status: BarberStatus.Pending, page: 1 })).toBe(false);
    expect(hasBarberApprovalFilters({ status: "all", page: 1 })).toBe(true);
  });
});

describe("review moderation filters", () => {
  it("opens the disputed queue by default", () => {
    expect(reviewModerationFiltersFromParams(params("status=bogus"))).toEqual({ status: ReviewStatus.Disputed, page: 1 });
    expect(reviewModerationFiltersFromParams(params("status=hidden&page=2"))).toEqual({ status: ReviewStatus.Hidden, page: 2 });
  });

  it("omits defaults from the URL but always sends the status to the API", () => {
    expect(reviewModerationFiltersToParams({ status: ReviewStatus.Disputed, page: 1 }).toString()).toBe("");
    expect(reviewModerationFiltersToParams({ status: ReviewStatus.Hidden, page: 3 }).toString()).toBe("status=hidden&page=3");
    expect(reviewModerationQueryString({ status: ReviewStatus.Disputed, page: 1 })).toBe("status=disputed&per_page=10&page=1");
  });
});

describe("admin user filters", () => {
  it("defaults to all and converts the state to an active flag", () => {
    expect(adminUserFiltersFromParams(params("state=x")).state).toBe(AdminUserState.All);
    expect(adminUserQueryString({ state: AdminUserState.All, page: 1 }, 10)).toBe("per_page=10&page=1");
    expect(adminUserQueryString({ state: AdminUserState.Active, page: 1 }, 10)).toContain("active=1");
    expect(adminUserQueryString({ state: AdminUserState.Inactive, page: 1, search: "z" }, 10)).toBe("per_page=10&page=1&active=0&search=z");
  });

  it("round-trips and reports active filters", () => {
    const filters = { state: AdminUserState.Inactive, search: "z", page: 2 };
    expect(adminUserFiltersFromParams(adminUserFiltersToParams(filters))).toEqual(filters);
    expect(hasAdminUserFilters({ state: AdminUserState.All, page: 1 })).toBe(false);
    expect(hasAdminUserFilters(filters)).toBe(true);
  });
});
