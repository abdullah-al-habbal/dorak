"use client";

import { useQuery } from "@tanstack/react-query";
import type { UseQueryResult } from "@tanstack/react-query";

import { accountKeys } from "@/lib/account-keys";
import { fetchNotificationPreferences } from "@/services/api/query/account.query";
import type { NotificationPreferences } from "@/types/notification-preferences.type";

export function useNotificationPreferences(): UseQueryResult<NotificationPreferences> {
  return useQuery({ queryKey: accountKeys.notifications, queryFn: fetchNotificationPreferences });
}
