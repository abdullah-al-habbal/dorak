import type { z } from "zod";

import type { notificationPreferencesSchema } from "@/schemas/account/notification-preferences.zod";

export type NotificationPreferences = z.infer<typeof notificationPreferencesSchema>;
