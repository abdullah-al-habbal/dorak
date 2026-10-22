"use client";

import { markNotificationRead } from "@/services/api/notification-inbox.mutation";
import { decrementUnread } from "@/services/api/notification-inbox-mapper.util";
import type { INotificationInbox } from "@/services/api/notification-inbox.types";
import { useMutation, useQueryClient } from "@tanstack/react-query";

export function useMarkNotificationReadMutation() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: markNotificationRead,
    onSuccess: (notification) => {
      queryClient.setQueryData<INotificationInbox>(
        ["notifications"],
        (inbox) =>
          inbox
            ? decrementUnread(
                inbox,
                notification.id,
                notification.readAt ?? new Date().toISOString(),
              )
            : inbox,
      );
      return queryClient.invalidateQueries({ queryKey: ["notifications"] });
    },
  });
}
