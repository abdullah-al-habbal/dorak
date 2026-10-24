import { apiRequest } from "@/services/api/client";
import { DashboardEndpoints } from "@/services/api/dashboard/endpoints/dashboard.endpoints";
import type { INotificationPreferences } from "@/services/api/dashboard/inotification-preferences.types";
import type { IProfile } from "@/services/api/dashboard/iprofile.types";
import type { ISettings } from "@/services/api/dashboard/isettings.types";

export function getProfile() {
  return apiRequest<IProfile>(DashboardEndpoints.profile, {
    auth: "session",
  });
}

export function getNotificationPreferences() {
  return apiRequest<INotificationPreferences>(
    DashboardEndpoints.profileNotifications,
    { auth: "session" },
  );
}

export function getSettings() {
  return apiRequest<ISettings>(DashboardEndpoints.settings, {
    auth: "session",
  });
}
