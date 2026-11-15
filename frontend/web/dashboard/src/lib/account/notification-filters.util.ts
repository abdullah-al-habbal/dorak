import type { NotificationFilters } from "@/types/account/profile/notification-filters.type";

const UNREAD_PARAM = "unread";
const UNREAD_VALUE = "1";

/** A bare URL lists every notification; `unread=1` keeps the unread ones. */
export function notificationFiltersFromParams(params: URLSearchParams): NotificationFilters {
  const page = Number(params.get("page"));
  return {
    unreadOnly: params.get(UNREAD_PARAM) === UNREAD_VALUE,
    page: Number.isInteger(page) && page > 0 ? page : 1,
  };
}

export function notificationFiltersToParams(filters: NotificationFilters): URLSearchParams {
  const params = new URLSearchParams();
  if (filters.unreadOnly) params.set(UNREAD_PARAM, UNREAD_VALUE);
  if (filters.page > 1) params.set("page", String(filters.page));
  return params;
}

/** The backend query string (`unread` is a boolean the request validates). */
export function notificationQueryString(filters: NotificationFilters, perPage: number): string {
  const params = new URLSearchParams({ per_page: String(perPage), page: String(filters.page) });
  if (filters.unreadOnly) params.set(UNREAD_PARAM, "1");
  return params.toString();
}

export function hasNotificationFilters(filters: NotificationFilters): boolean {
  return filters.unreadOnly;
}
