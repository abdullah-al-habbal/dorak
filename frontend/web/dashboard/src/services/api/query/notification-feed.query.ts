import { NOTIFICATION_PER_PAGE } from "@/config/notification.constant";
import { DASHBOARD_API } from "@/config/routes.constant";
import { dashboardNotificationListSchema, unreadCountSchema } from "@/schemas/dashboard-notification.zod";
import { apiRequestWithMeta } from "@/services/api/core/client";
import type { NotificationFeed } from "@/types/account/notification-feed.type";

export async function fetchNotificationFeed(): Promise<NotificationFeed> {
  const { data, meta } = await apiRequestWithMeta(`${DASHBOARD_API}/notifications?per_page=${NOTIFICATION_PER_PAGE}`, { schema: dashboardNotificationListSchema });
  const unread = unreadCountSchema.safeParse(meta);
  return { items: data, unreadCount: unread.success ? unread.data.unread_count : data.filter((item) => !item.read_at).length };
}
