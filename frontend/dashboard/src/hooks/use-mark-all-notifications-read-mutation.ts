"use client";

import { markAllNotificationsRead } from "@/services/api/notification-inbox.mutation";
import { useMutation, useQueryClient } from "@tanstack/react-query";

export function useMarkAllNotificationsReadMutation() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: markAllNotificationsRead,
    onSuccess: () =>
      queryClient.invalidateQueries({ queryKey: ["notifications"] }),
  });
}
