import { ROUTES } from "@/config/routes.constant";
import { apiRequest } from "@/services/api/client";
import type { INotificationInbox } from "@/services/api/notification-inbox.types";

export function getNotificationInbox(): Promise<INotificationInbox> {
  return apiRequest<INotificationInbox>(
    `${ROUTES.api.notifications.inbox}?per_page=20`,
    { auth: "session" },
  );
}
