import { describe, expect, it } from "vitest";

import { applyFilterPatch, toReplaceHref } from "@/lib/core/url-query.util";

const PATH = "/dashboard/manager/bookings";

interface ListFilters {
  page: number;
  status: string | undefined;
  search: string | undefined;
}

const FILTERS: ListFilters = { page: 3, status: "pending", search: "nadia" };

describe("url query util", () => {
  it("leaves the bare pathname for an empty query", () => {
    expect(toReplaceHref(PATH, "")).toBe(PATH);
  });

  it("appends a non-empty query as is", () => {
    expect(toReplaceHref(PATH, "view=list&page=2")).toBe(`${PATH}?view=list&page=2`);
  });

  it("resets to page 1 when any filter other than the page changes", () => {
    expect(applyFilterPatch(FILTERS, { status: "confirmed" })).toEqual({ page: 1, status: "confirmed", search: "nadia" });
    expect(applyFilterPatch(FILTERS, { search: undefined })).toEqual({ page: 1, status: "pending", search: undefined });
  });

  it("keeps the requested page on a page-only patch", () => {
    expect(applyFilterPatch(FILTERS, { page: 4 })).toEqual({ page: 4, status: "pending", search: "nadia" });
  });

  it("lets an explicit page win over the reset when both change", () => {
    expect(applyFilterPatch(FILTERS, { status: "confirmed", page: 2 })).toEqual({ page: 2, status: "confirmed", search: "nadia" });
  });

  it("does not mutate the current filters", () => {
    const current = { ...FILTERS };
    applyFilterPatch(current, { status: "confirmed" });
    expect(current).toEqual(FILTERS);
  });
});
