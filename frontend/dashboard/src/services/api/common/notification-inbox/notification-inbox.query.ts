import { api } from "@/services/api/core/client";
import { NotificationInboxEndpoints } from "@/services/api/common/notification-inbox/endpoints/notification-inbox.endpoints";
import type { NotificationInbox } from "@/services/api/common/notification-inbox/types/notification-inbox.types";

export function getNotificationInbox(): Promise<NotificationInbox> {
  return api.get<NotificationInbox>(
    `${NotificationInboxEndpoints.inbox}?per_page=20`,
  );
}
