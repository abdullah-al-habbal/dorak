import { api } from "@/services/api/client";
import { DashboardEndpoints } from "@/services/api/dashboard/endpoints/dashboard.endpoints";
import type { INotificationPreferences } from "@/services/api/dashboard/inotification-preferences.types";
import type { IProfile } from "@/services/api/dashboard/iprofile.types";
import type { ISettings } from "@/services/api/dashboard/isettings.types";
import type { IUpdatePasswordInput } from "@/services/api/dashboard/iupdate-password-input.types";
import type { IUpdateProfileInput } from "@/services/api/dashboard/iupdate-profile-input.types";
import type { IUpdateSettingsInput } from "@/services/api/dashboard/iupdate-settings-input.types";

export function updateProfile(input: IUpdateProfileInput): Promise<IProfile> {
  return api.patch<IProfile>(DashboardEndpoints.profile, input);
}

export async function updatePassword(
  input: IUpdatePasswordInput,
): Promise<void> {
  await api.put<{ passwordUpdated: boolean }>(
    DashboardEndpoints.profilePassword,
    input,
  );
}

export function requestEmailChange(
  email: string,
): Promise<{ pendingEmail: string; expiresAt: string }> {
  return api.post<{ pendingEmail: string; expiresAt: string }>(
    DashboardEndpoints.profileEmailChange,
    { email },
  );
}

export function verifyEmailChange(code: string): Promise<IProfile> {
  return api.post<IProfile>(DashboardEndpoints.profileEmailVerify, { code });
}

export async function updateNotificationPreferences(
  input: INotificationPreferences,
): Promise<INotificationPreferences> {
  return api.patch<INotificationPreferences>(
    DashboardEndpoints.profileNotifications,
    input,
  );
}

export async function updateSettings(
  input: IUpdateSettingsInput,
): Promise<ISettings> {
  return api.patch<ISettings>(DashboardEndpoints.settings, input);
}
