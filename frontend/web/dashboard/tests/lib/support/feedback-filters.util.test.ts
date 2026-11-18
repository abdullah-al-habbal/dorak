import { describe, expect, it } from "vitest";

import { feedbackFiltersFromParams, feedbackFiltersToParams, feedbackQueryString, hasFeedbackFilters } from "@/lib/support/feedback-filters.util";

describe("feedback filters", () => {
  it("falls back to all for unknown values and to page 1 for a bad page", () => {
    const filters = feedbackFiltersFromParams(new URLSearchParams("kind=rant&status=spam&page=-2&search=%20%20"));
    expect(filters).toEqual({ kind: "all", status: "spam", app: "all", platform: "all", search: undefined, page: 1 });
  });

  it("round-trips through the URL and sends only real filters to the API", () => {
    const filters = feedbackFiltersFromParams(new URLSearchParams("kind=bug&app=client&search=crash&page=3"));
    expect(feedbackFiltersToParams(filters).toString()).toBe("kind=bug&app=client&search=crash&page=3");
    const query = new URLSearchParams(feedbackQueryString(filters, 20));
    expect(query.get("per_page")).toBe("20");
    expect(query.get("status")).toBeNull();
    expect(query.get("platform")).toBeNull();
  });

  it("knows when a filter is applied", () => {
    expect(hasFeedbackFilters(feedbackFiltersFromParams(new URLSearchParams()))).toBe(false);
    expect(hasFeedbackFilters(feedbackFiltersFromParams(new URLSearchParams("platform=ios")))).toBe(true);
  });
});
