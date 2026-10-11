import { apiRequest } from "@/services/api/client";
import type { INotificationPreferences } from "@/services/api/dashboard/inotification-preferences.types";
import type { IProfile } from "@/services/api/dashboard/iprofile.types";

export function getProfile() {
  return apiRequest<IProfile>("/api/dashboard/profile", { auth: "session" });
}

export function getNotificationPreferences() {
  return apiRequest<INotificationPreferences>(
    "/api/dashboard/profile/notifications",
    { auth: "session" },
  );
}
