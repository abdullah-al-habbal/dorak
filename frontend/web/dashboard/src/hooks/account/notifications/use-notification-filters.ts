"use client";

import { useUrlFilters } from "@/hooks/core/state/use-url-filters";
import { notificationFiltersFromParams, notificationFiltersToParams } from "@/lib/account/notification-filters.util";
import type { NotificationFilters } from "@/types/account/profile/notification-filters.type";

/** The URL is the source of truth for the unread filter and the page. */
export function useNotificationFilters(): { filters: NotificationFilters; update: (patch: Partial<NotificationFilters>) => void } {
  return useUrlFilters(notificationFiltersFromParams, notificationFiltersToParams);
}
