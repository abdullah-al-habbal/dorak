import type { INotificationItem } from "@/services/api/notification-inbox.types";

export interface NotificationBellItemProps {
  notification: INotificationItem;
  unreadLabel: string;
}
