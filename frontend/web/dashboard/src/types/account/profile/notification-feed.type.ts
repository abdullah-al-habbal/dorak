import type { DashboardNotification } from "@/types/account/profile/dashboard-notification.type";

export interface NotificationFeed {
  items: DashboardNotification[];
  unreadCount: number;
}
