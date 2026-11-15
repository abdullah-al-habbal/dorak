import { z } from "zod";

/** `GET /notifications` (`NotificationResource`). */
export const dashboardNotificationSchema = z.object({
  id: z.string(),
  type: z.string(),
  title: z.string(),
  body: z.string(),
  data: z.record(z.string(), z.unknown()).default({}),
  read_at: z.string().nullable().optional(),
  created_at: z.string(),
});

export const dashboardNotificationListSchema = z.array(dashboardNotificationSchema);

/** `meta.unread_count`, and the answer of mark-all. */
export const unreadCountSchema = z.object({ unread_count: z.number() });
