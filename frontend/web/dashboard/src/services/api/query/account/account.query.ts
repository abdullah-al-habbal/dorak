import { ACCOUNT_API } from "@/config/account.constant";
import { DASHBOARD_API } from "@/config/routes.constant";
import { accountProfileSchema } from "@/schemas/account/account-profile.zod";
import { accountSettingsSchema } from "@/schemas/account/account-settings.zod";
import { notificationPreferencesSchema } from "@/schemas/account/notification-preferences.zod";
import { apiRequest } from "@/services/api/core/client";
import type { AccountProfile } from "@/types/account/account-profile.type";
import type { AccountSettings } from "@/types/account/account-settings.type";
import type { NotificationPreferences } from "@/types/account/notification-preferences.type";

export async function fetchAccountProfile(): Promise<AccountProfile> {
  return apiRequest(`${DASHBOARD_API}${ACCOUNT_API.profile}`, { schema: accountProfileSchema });
}

export async function fetchNotificationPreferences(): Promise<NotificationPreferences> {
  return apiRequest(`${DASHBOARD_API}${ACCOUNT_API.notifications}`, { schema: notificationPreferencesSchema });
}

export async function fetchAccountSettings(): Promise<AccountSettings> {
  return apiRequest(`${DASHBOARD_API}${ACCOUNT_API.settings}`, { schema: accountSettingsSchema });
}
