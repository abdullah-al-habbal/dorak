import { apiRequest } from "@/services/api/client";
import { DashboardEndpoints } from "@/services/api/dashboard/endpoints/dashboard.endpoints";
import type { INotificationPreferences } from "@/services/api/dashboard/inotification-preferences.types";
import type { IProfile } from "@/services/api/dashboard/iprofile.types";
import type { ISettings } from "@/services/api/dashboard/isettings.types";
import type { IUpdatePasswordInput } from "@/services/api/dashboard/iupdate-password-input.types";
import type { IUpdateProfileInput } from "@/services/api/dashboard/iupdate-profile-input.types";
import type { IUpdateSettingsInput } from "@/services/api/dashboard/iupdate-settings-input.types";

export function updateProfile(input: IUpdateProfileInput): Promise<IProfile> {
  return apiRequest<IProfile>(DashboardEndpoints.profile, {
    auth: "session",
    method: "PATCH",
    body: JSON.stringify(input),
  });
}

export async function updatePassword(
  input: IUpdatePasswordInput,
): Promise<void> {
  await apiRequest<{ passwordUpdated: boolean }>(
    DashboardEndpoints.profilePassword,
    {
      auth: "session",
      method: "PUT",
      body: JSON.stringify(input),
    },
  );
}

export function requestEmailChange(
  email: string,
): Promise<{ pendingEmail: string; expiresAt: string }> {
  return apiRequest<{ pendingEmail: string; expiresAt: string }>(
    DashboardEndpoints.profileEmailChange,
    {
      auth: "session",
      method: "POST",
      body: JSON.stringify({ email }),
    },
  );
}

export function verifyEmailChange(code: string): Promise<IProfile> {
  return apiRequest<IProfile>(DashboardEndpoints.profileEmailVerify, {
    auth: "session",
    method: "POST",
    body: JSON.stringify({ code }),
  });
}

export async function updateNotificationPreferences(
  input: INotificationPreferences,
): Promise<INotificationPreferences> {
  return apiRequest<INotificationPreferences>(
    DashboardEndpoints.profileNotifications,
    {
      auth: "session",
      method: "PATCH",
      body: JSON.stringify(input),
    },
  );
}

export async function updateSettings(
  input: IUpdateSettingsInput,
): Promise<ISettings> {
  return apiRequest<ISettings>(DashboardEndpoints.settings, {
    auth: "session",
    method: "PATCH",
    body: JSON.stringify(input),
  });
}
