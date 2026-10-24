import { apiRequest } from "@/services/api/client";
import { NotificationInboxEndpoints } from "@/services/api/notification-inbox/endpoints/notification-inbox.endpoints";
import type { NotificationInbox } from "@/services/api/notification-inbox.types";

export function getNotificationInbox(): Promise<NotificationInbox> {
  return apiRequest<NotificationInbox>(
    `${NotificationInboxEndpoints.inbox}?per_page=20`,
    { auth: "session" },
  );
}
