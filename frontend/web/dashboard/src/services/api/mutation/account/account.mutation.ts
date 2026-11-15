import { ACCOUNT_API } from "@/config/money-shell/account.constant";
import { DASHBOARD_API } from "@/config/routes.constant";
import { HttpMethod } from "@/enums/access/http-method.enum";
import type { Locale } from "@/enums/access/locale.enum";
import { accountProfileSchema } from "@/schemas/account/account/account-profile.zod";
import { accountSettingsSchema } from "@/schemas/account/account/account-settings.zod";
import { emailChangeResultSchema } from "@/schemas/account/account/email-change-result.zod";
import { notificationPreferencesSchema } from "@/schemas/account/account/notification-preferences.zod";
import { apiRequest } from "@/services/api/core/client";
import type { AccountProfile } from "@/types/account/profile/account-profile.type";
import type { AccountSettings } from "@/types/account/profile/account-settings.type";
import type { EmailChangeResult } from "@/types/account/profile/email-change-result.type";
import type { NotificationPreferences } from "@/types/account/profile/notification-preferences.type";

export async function updateDisplayName(displayName: string): Promise<AccountProfile> {
  return apiRequest(`${DASHBOARD_API}${ACCOUNT_API.profile}`, { method: HttpMethod.Patch, body: { display_name: displayName }, schema: accountProfileSchema });
}

export async function requestEmailChange(email: string): Promise<EmailChangeResult> {
  return apiRequest(`${DASHBOARD_API}${ACCOUNT_API.emailChange}`, { method: HttpMethod.Post, body: { email }, schema: emailChangeResultSchema });
}

export async function verifyEmailChange(code: string): Promise<AccountProfile> {
  return apiRequest(`${DASHBOARD_API}${ACCOUNT_API.emailVerify}`, { method: HttpMethod.Post, body: { code }, schema: accountProfileSchema });
}

export async function updateNotificationPreferences(preferences: NotificationPreferences): Promise<NotificationPreferences> {
  return apiRequest(`${DASHBOARD_API}${ACCOUNT_API.notifications}`, { method: HttpMethod.Patch, body: preferences, schema: notificationPreferencesSchema });
}

export async function updatePreferredLanguage(locale: Locale): Promise<AccountSettings> {
  return apiRequest(`${DASHBOARD_API}${ACCOUNT_API.settings}`, { method: HttpMethod.Patch, body: { preferred_language: locale }, schema: accountSettingsSchema });
}
