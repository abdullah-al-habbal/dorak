import type { z } from "zod";

import type { dashboardNotificationSchema } from "@/schemas/dashboard-notification.zod";

export type DashboardNotification = z.infer<typeof dashboardNotificationSchema>;
