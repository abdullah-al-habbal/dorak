import { apiRequest } from "@/services/api/client";
import { NotificationInboxEndpoints } from "@/services/api/notification-inbox/endpoints/notification-inbox.endpoints";
import type {
  NotificationItem,
  NotificationReadAll,
} from "@/services/api/notification-inbox.types";

export function markNotificationRead(id: string): Promise<NotificationItem> {
  return apiRequest<NotificationItem>(NotificationInboxEndpoints.markRead(id), {
    auth: "session",
    method: "PATCH",
  });
}

export function markAllNotificationsRead(): Promise<NotificationReadAll> {
  return apiRequest<NotificationReadAll>(
    NotificationInboxEndpoints.markAllRead,
    { auth: "session", method: "POST" },
  );
}
