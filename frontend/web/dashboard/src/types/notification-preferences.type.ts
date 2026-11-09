import type { z } from "zod";

import type { notificationPreferencesSchema } from "@/schemas/notification-preferences.zod";

export type NotificationPreferences = z.infer<typeof notificationPreferencesSchema>;
