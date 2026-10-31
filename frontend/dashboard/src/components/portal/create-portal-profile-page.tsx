import type { ProfilePageKey } from "@/config/profile-ui.types";
import { PORTAL_PROFILE_PAGES } from "@/components/portal/create-portal-profile-page.constant";

// Keyed by the same tab union as `PROFILE_TABS`, so a new tab cannot ship without its page.
export function createPortalProfilePage(page: ProfilePageKey) {
  const ProfilePageComponent = PORTAL_PROFILE_PAGES[page];

  return function PortalProfilePage() {
    return <ProfilePageComponent />;
  };
}
