"use client";

import { useQuery } from "@tanstack/react-query";
import type { UseQueryResult } from "@tanstack/react-query";

import { NOTIFICATION_POLL_MS } from "@/config/notification.constant";
import { notificationKeys } from "@/lib/query-keys/account/notification-keys";
import { fetchNotificationFeed } from "@/services/api/query/notification-feed.query";
import type { NotificationFeed } from "@/types/account/notification-feed.type";

/** D5: polls every 60 seconds, only while the tab is visible. This query opts in because the app turns refetch-on-focus off globally. */
export function useNotificationFeed(): UseQueryResult<NotificationFeed> {
  return useQuery({
    queryKey: notificationKeys.feed,
    queryFn: fetchNotificationFeed,
    refetchInterval: NOTIFICATION_POLL_MS,
    refetchIntervalInBackground: false,
    refetchOnWindowFocus: true,
  });
}
