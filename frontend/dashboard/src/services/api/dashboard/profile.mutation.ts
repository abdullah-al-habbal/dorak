import { apiRequest } from "@/services/api/client";
import type { INotificationPreferences } from "@/services/api/dashboard/inotification-preferences.types";
import type { IProfile } from "@/services/api/dashboard/iprofile.types";
import type { IUpdatePasswordInput } from "@/services/api/dashboard/iupdate-password-input.types";
import type { IUpdateProfileInput } from "@/services/api/dashboard/iupdate-profile-input.types";

export function updateProfile(input: IUpdateProfileInput): Promise<IProfile> {
  return apiRequest<IProfile>("/api/dashboard/profile", {
    auth: "session",
    method: "PATCH",
    body: JSON.stringify(input),
  });
}

export async function updatePassword(
  input: IUpdatePasswordInput,
): Promise<void> {
  await apiRequest<{ passwordUpdated: boolean }>(
    "/api/dashboard/profile/password",
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
    "/api/dashboard/profile/email/change",
    {
      auth: "session",
      method: "POST",
      body: JSON.stringify({ email }),
    },
  );
}

export function verifyEmailChange(code: string): Promise<IProfile> {
  return apiRequest<IProfile>("/api/dashboard/profile/email/verify", {
    auth: "session",
    method: "POST",
    body: JSON.stringify({ code }),
  });
}

export async function updateNotificationPreferences(
  input: INotificationPreferences,
): Promise<INotificationPreferences> {
  return apiRequest<INotificationPreferences>(
    "/api/dashboard/profile/notifications",
    {
      auth: "session",
      method: "PATCH",
      body: JSON.stringify(input),
    },
  );
}
