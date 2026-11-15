"use client";

import { useMutation, useQueryClient } from "@tanstack/react-query";
import type { UseMutationResult } from "@tanstack/react-query";

import { notificationKeys } from "@/lib/query-keys/account/notification-keys";
import { markAllNotificationsRead, markNotificationRead } from "@/services/api/mutation/account/notification-read.mutation";

/** Quiet by design: reading a notification needs no toast, only a refreshed feed. */
export function useMarkNotificationRead(): UseMutationResult<unknown, Error, string> {
  const client = useQueryClient();
  return useMutation({ mutationFn: markNotificationRead, onSettled: () => client.invalidateQueries({ queryKey: notificationKeys.all }) });
}

export function useMarkAllNotificationsRead(): UseMutationResult<unknown, Error, void> {
  const client = useQueryClient();
  return useMutation({ mutationFn: markAllNotificationsRead, onSettled: () => client.invalidateQueries({ queryKey: notificationKeys.all }) });
}
