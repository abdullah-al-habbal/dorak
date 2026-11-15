"use client";

import type { UseQueryResult } from "@tanstack/react-query";

import { useListQuery } from "@/hooks/core/query/use-list-query";
import { notificationKeys } from "@/lib/query-keys/account/notification-keys";
import { fetchNotificationPage } from "@/services/api/query/account/notification-page.query";
import type { NotificationFilters } from "@/types/account/profile/notification-filters.type";
import type { NotificationPage } from "@/types/account/profile/notification-page.type";

export function useNotificationPage(filters: NotificationFilters): UseQueryResult<NotificationPage> {
  return useListQuery(notificationKeys.list(filters), () => fetchNotificationPage(filters));
}
