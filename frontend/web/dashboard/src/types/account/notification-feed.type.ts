import type { DashboardNotification } from "@/types/account/dashboard-notification.type";

export interface NotificationFeed {
  items: DashboardNotification[];
  unreadCount: number;
}
