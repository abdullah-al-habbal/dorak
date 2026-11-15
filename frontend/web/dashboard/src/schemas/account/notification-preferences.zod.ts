import { z } from "zod";

export const notificationPreferencesSchema = z.object({
  allows_email_notifications: z.boolean(),
  allows_push_notifications: z.boolean(),
  allows_booking_notifications: z.boolean(),
  allows_system_notifications: z.boolean(),
});
