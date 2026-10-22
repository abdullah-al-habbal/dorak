import { ROUTES } from "@/config/routes.constant";
import { apiRequest } from "@/services/api/client";
import type {
  INotificationItem,
  INotificationReadAll,
} from "@/services/api/notification-inbox.types";

export function markNotificationRead(id: string): Promise<INotificationItem> {
  return apiRequest<INotificationItem>(
    `${ROUTES.api.notifications.inbox}/${encodeURIComponent(id)}/read`,
    { auth: "session", method: "PATCH" },
  );
}

export function markAllNotificationsRead(): Promise<INotificationReadAll> {
  return apiRequest<INotificationReadAll>(
    `${ROUTES.api.notifications.inbox}/read-all`,
    { auth: "session", method: "POST" },
  );
}
