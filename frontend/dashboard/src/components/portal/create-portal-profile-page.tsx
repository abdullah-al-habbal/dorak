import { AccountDetails } from "@/components/profile/account/account-details";
import { NotificationPreferences } from "@/components/profile/notification/notification-preferences";
import { SecuritySettings } from "@/components/profile/security/security-settings";
import { SettingsPreferences } from "@/components/profile/settings/settings-preferences";
import type { ProfilePageKey } from "@/config/profile-ui.types";

// Keyed by the same tab union as `PROFILE_TABS`, so a new tab cannot ship without its page.
const PROFILE_PAGES = {
  account: AccountDetails,
  security: SecuritySettings,
  notification: NotificationPreferences,
  settings: SettingsPreferences,
} as const satisfies Record<ProfilePageKey, () => React.JSX.Element>;

export function createPortalProfilePage(page: ProfilePageKey) {
  const ProfilePageComponent = PROFILE_PAGES[page];

  return function PortalProfilePage() {
    return <ProfilePageComponent />;
  };
}
