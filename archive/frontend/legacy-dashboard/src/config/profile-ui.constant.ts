import type { ProfileTabConfig } from "@/config/profile-ui.types";
import { ROUTES } from "@/config/routes.constant";

// Profile navigation belongs here. Adding a tab changes this config only; the
// icon key resolves to a component in `@/components/profile/profile-tab-icons.constant`.
export const PROFILE_TABS = [
  {
    tab: "account",
    icon: "user",
    href: (actor) => ROUTES.portal[actor].profile.account,
  },
  {
    tab: "security",
    icon: "user",
    href: (actor) => ROUTES.portal[actor].profile.security,
  },
  {
    tab: "notification",
    icon: "user",
    href: (actor) => ROUTES.portal[actor].profile.notification,
  },
  {
    tab: "settings",
    icon: "user",
    href: (actor) => ROUTES.portal[actor].profile.settings,
  },
] as const satisfies readonly ProfileTabConfig[];
