import { api } from "@/services/api/client";
import { DashboardEndpoints } from "@/services/api/dashboard/endpoints/dashboard.endpoints";
import type { INotificationPreferences } from "@/services/api/dashboard/inotification-preferences.types";
import type { IProfile } from "@/services/api/dashboard/iprofile.types";
import type { ISettings } from "@/services/api/dashboard/isettings.types";

export function getProfile() {
  return api.get<IProfile>(DashboardEndpoints.profile);
}

export function getNotificationPreferences() {
  return api.get<INotificationPreferences>(
    DashboardEndpoints.profileNotifications,
  );
}

export function getSettings() {
  return api.get<ISettings>(DashboardEndpoints.settings);
}
