"use client";

import { useQuery } from "@tanstack/react-query";
import type { UseQueryResult } from "@tanstack/react-query";

import { accountKeys } from "@/lib/query-keys/account/account-keys";
import { fetchNotificationPreferences } from "@/services/api/query/account.query";
import type { NotificationPreferences } from "@/types/account/notification-preferences.type";

export function useNotificationPreferences(): UseQueryResult<NotificationPreferences> {
  return useQuery({ queryKey: accountKeys.notifications, queryFn: fetchNotificationPreferences });
}
