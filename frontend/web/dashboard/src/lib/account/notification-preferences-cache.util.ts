import type { NotificationPreferenceKey } from "@/types/account/profile/notification-preference-key.type";
import type { NotificationPreferences } from "@/types/account/profile/notification-preferences.type";

/** The cached preferences with one switch set; nothing to patch before the first load. */
export function withNotificationPreference(cached: NotificationPreferences | undefined, key: NotificationPreferenceKey, enabled: boolean): NotificationPreferences | undefined {
  return cached ? { ...cached, [key]: enabled } : cached;
}
