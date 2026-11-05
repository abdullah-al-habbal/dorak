import { z } from "zod";
import { NotificationPreferencesSchema } from "@/services/api/dashboard/shared/schemas/dashboard-profile.schema";

export type INotificationPreferences = z.infer<
  typeof NotificationPreferencesSchema
>;
