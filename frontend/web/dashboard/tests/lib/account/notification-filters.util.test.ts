import { describe, expect, it } from "vitest";

import { hasNotificationFilters, notificationFiltersFromParams, notificationFiltersToParams, notificationQueryString } from "@/lib/account/notification-filters.util";

describe("notification filters", () => {
  it("reads a bare URL as all notifications on page 1", () => {
    expect(notificationFiltersFromParams(new URLSearchParams())).toEqual({ unreadOnly: false, page: 1 });
  });

  it("reads unread and page, and ignores bad values", () => {
    expect(notificationFiltersFromParams(new URLSearchParams("unread=1&page=3"))).toEqual({ unreadOnly: true, page: 3 });
    expect(notificationFiltersFromParams(new URLSearchParams("unread=yes&page=-2"))).toEqual({ unreadOnly: false, page: 1 });
  });

  it("round-trips and keeps defaults out of the URL", () => {
    expect(notificationFiltersToParams({ unreadOnly: false, page: 1 }).toString()).toBe("");
    const filters = { unreadOnly: true, page: 2 };
    expect(notificationFiltersFromParams(notificationFiltersToParams(filters))).toEqual(filters);
  });

  it("builds the backend query string", () => {
    expect(notificationQueryString({ unreadOnly: false, page: 2 }, 15)).toBe("per_page=15&page=2");
    expect(notificationQueryString({ unreadOnly: true, page: 1 }, 15)).toBe("per_page=15&page=1&unread=1");
  });

  it("flags only the unread filter as active", () => {
    expect(hasNotificationFilters({ unreadOnly: true, page: 1 })).toBe(true);
    expect(hasNotificationFilters({ unreadOnly: false, page: 4 })).toBe(false);
  });
});
