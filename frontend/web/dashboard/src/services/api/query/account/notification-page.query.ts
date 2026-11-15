import { NOTIFICATION_PAGE_SIZE } from "@/config/money-shell/notification.constant";
import { DASHBOARD_API } from "@/config/routes.constant";
import { notificationQueryString } from "@/lib/account/notification-filters.util";
import { resolvePageInfo } from "@/lib/core/query/resolve-page-info.util";
import { dashboardNotificationListSchema, unreadCountSchema } from "@/schemas/account/account/dashboard-notification.zod";
import { apiRequestWithMeta } from "@/services/api/core/client";
import type { NotificationFilters } from "@/types/account/profile/notification-filters.type";
import type { NotificationPage } from "@/types/account/profile/notification-page.type";

export async function fetchNotificationPage(filters: NotificationFilters, perPage: number = NOTIFICATION_PAGE_SIZE): Promise<NotificationPage> {
  const { data, meta } = await apiRequestWithMeta(`${DASHBOARD_API}/notifications?${notificationQueryString(filters, perPage)}`, { schema: dashboardNotificationListSchema });
  const unread = unreadCountSchema.safeParse(meta);
  return {
    items: data,
    unreadCount: unread.success ? unread.data.unread_count : 0,
    page: resolvePageInfo(meta, data.length, perPage, filters.page),
  };
}
