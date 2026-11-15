import type { DashboardNotification } from "@/types/account/profile/dashboard-notification.type";
import type { PageInfo } from "@/types/core/shared/page-info.type";

export interface NotificationPage {
  items: DashboardNotification[];
  unreadCount: number;
  page: PageInfo;
}
