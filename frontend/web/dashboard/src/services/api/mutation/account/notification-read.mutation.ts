import { z } from "zod";

import { DASHBOARD_API } from "@/config/routes.constant";
import { HttpMethod } from "@/enums/access/http-method.enum";
import { dashboardNotificationSchema } from "@/schemas/account/account/dashboard-notification.zod";
import { apiRequest } from "@/services/api/core/client";
import type { DashboardNotification } from "@/types/account/profile/dashboard-notification.type";

export function markNotificationRead(id: string): Promise<DashboardNotification> {
  return apiRequest(`${DASHBOARD_API}/notifications/${encodeURIComponent(id)}/read`, { method: HttpMethod.Patch, schema: dashboardNotificationSchema });
}

export function markAllNotificationsRead(): Promise<{ updated: number }> {
  return apiRequest(`${DASHBOARD_API}/notifications/read-all`, { method: HttpMethod.Post, schema: z.object({ updated: z.number() }) });
}
