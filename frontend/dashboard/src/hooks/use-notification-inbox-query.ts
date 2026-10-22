"use client";

import { getNotificationInbox } from "@/services/api/notification-inbox.query";
import { useQuery } from "@tanstack/react-query";

/** Notifications are written by a queued job after the booking broadcast, so poll as a safety net. */
export function useNotificationInboxQuery(enabled = true) {
  return useQuery({
    queryKey: ["notifications"],
    queryFn: getNotificationInbox,
    enabled,
    refetchInterval: 60_000,
  });
}
