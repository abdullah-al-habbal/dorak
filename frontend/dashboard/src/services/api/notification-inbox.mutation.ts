import { api } from "@/services/api/client";
import { NotificationInboxEndpoints } from "@/services/api/notification-inbox/endpoints/notification-inbox.endpoints";
import type {
  NotificationItem,
  NotificationReadAll,
} from "@/services/api/notification-inbox.types";

export function markNotificationRead(id: string): Promise<NotificationItem> {
  return api.patch<NotificationItem>(NotificationInboxEndpoints.markRead(id));
}

export function markAllNotificationsRead(): Promise<NotificationReadAll> {
  return api.post<NotificationReadAll>(NotificationInboxEndpoints.markAllRead);
}
