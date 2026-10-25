import type { INotificationItem } from "@/services/api/common/notification-inbox/types/notification-inbox.types";

export interface NotificationBellItemProps {
  notification: INotificationItem;
  unreadLabel: string;
}
