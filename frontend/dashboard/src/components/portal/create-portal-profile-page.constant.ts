import { NotificationPreferences } from "@/components/profile/notification/notification-preferences";
import type { ProfilePageKey } from "@/config/profile-ui.types";
import { SettingsPreferences } from "@/components/profile/settings/settings-preferences";
import { SecuritySettings } from "@/components/profile/security/security-settings";
import { AccountDetails } from "@/components/profile/account/account-details";

export const PORTAL_PROFILE_PAGES = {
  account: AccountDetails,
  security: SecuritySettings,
  notification: NotificationPreferences,
  settings: SettingsPreferences,
} as const satisfies Record<ProfilePageKey, () => React.JSX.Element>;
