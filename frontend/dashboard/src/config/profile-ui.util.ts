import { PROFILE_TABS } from "@/config/profile-ui.constant";
import type { Breadcrumb } from "@/config/profile-ui.types";
import { ROUTES } from "@/config/routes.constant";
import { portalProfileFor, resolveActorHrefs } from "@/config/routes.util";
import type { Dictionary } from "@/i18n/dictionary.types";
import type { AuthActor } from "@/services/api/auth/types/auth.types";

export function getProfileTabs(actor: AuthActor) {
  return resolveActorHrefs(PROFILE_TABS, actor);
}

export function getProfileBreadcrumbs(
  actor: AuthActor,
  dictionary: Dictionary,
): Breadcrumb[] {
  const profile = portalProfileFor(actor);

  return [
    { href: ROUTES.portal[actor].root, label: dictionary.profile.home },
    { href: profile.root, label: dictionary.profile.title },
  ];
}
