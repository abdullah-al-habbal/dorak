import { apiRequest } from "@/services/api/client";
import type { INotificationPreferences } from "@/services/api/dashboard/inotification-preferences.types";
import type { IProfile } from "@/services/api/dashboard/iprofile.types";
import type { ISettings } from "@/services/api/dashboard/isettings.types";

export function getProfile() {
  return apiRequest<IProfile>("/api/dashboard/profile", { auth: "session" });
}

export function getNotificationPreferences() {
  return apiRequest<INotificationPreferences>(
    "/api/dashboard/profile/notifications",
    { auth: "session" },
  );
}

export function getSettings() {
  return apiRequest<ISettings>("/api/dashboard/settings", {
    auth: "session",
  });
}
