import type { DashboardNotification } from "@/types/dashboard-notification.type";

export interface NotificationFeed {
  items: DashboardNotification[];
  unreadCount: number;
}
