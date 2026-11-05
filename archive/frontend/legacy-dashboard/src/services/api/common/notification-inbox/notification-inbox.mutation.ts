import { api } from "@/services/api/core/client";
import { NotificationInboxEndpoints } from "@/services/api/common/notification-inbox/endpoints/notification-inbox.endpoints";
import type {
  NotificationItem,
  NotificationReadAll,
} from "@/services/api/common/notification-inbox/types/notification-inbox.types";

export function markNotificationRead(id: string): Promise<NotificationItem> {
  return api.patch<NotificationItem>(NotificationInboxEndpoints.markRead(id));
}

export function markAllNotificationsRead(): Promise<NotificationReadAll> {
  return api.post<NotificationReadAll>(NotificationInboxEndpoints.markAllRead);
}
