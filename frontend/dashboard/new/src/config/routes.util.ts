import { PORTAL_ACTORS, PORTAL_CONFIG, PORTAL_NAVIGATION, ROUTES } from "@/config/routes.constant";
import type { ActorHrefItem } from "@/config/routes.types";
import type { Dictionary } from "@/i18n/dictionary.types";
import type { AuthActor } from "@/services/api/auth/auth.types";

export function portalProfileFor(actor: AuthActor) {
  return ROUTES.portal[actor].profile;
}

/** `pathname` is `base` itself or any descendant of it (never a sibling prefix like `/admins`). */
export function isPathWithin(pathname: string, base: string): boolean {
  return pathname === base || pathname.startsWith(`${base}/`);
}

/** Resolve actor-scoped `href` builders of a navigation config to concrete paths. */
export function resolveActorHrefs<TItem extends ActorHrefItem>(items: readonly TItem[], actor: AuthActor) {
  return items.map((item) => ({ ...item, href: item.href(actor) }));
}

export function getPortalAuthTitle(actor: AuthActor, dictionary: Dictionary) {
  return dictionary.auth[PORTAL_CONFIG[actor].copy.authTitle];
}

export function getPortalTitle(actor: AuthActor, dictionary: Dictionary) {
  return dictionary.portal[PORTAL_CONFIG[actor].copy.portalTitle];
}

export function getPublicPortalLinks(dictionary: Dictionary) {
  return PORTAL_ACTORS.map((actor) => ({
    actor,
    href: PORTAL_CONFIG[actor].login,
    label: dictionary.public[PORTAL_CONFIG[actor].copy.publicLabel],
  }));
}

export function getPortalNavigation(actor: AuthActor, permissions: readonly string[]) {
  return resolveActorHrefs(
    PORTAL_NAVIGATION.filter(
      (item) =>
        item.actors.includes(actor) &&
        (!item.requiredPermissions || item.requiredPermissions.every((permission) => permissions.includes(permission))),
    ),
    actor,
  );
}

/** Mark only the deepest matching route active, so parent links never retain page state. */
export function getActivePortalNavigation(items: readonly { href: string }[], pathname: string) {
  const activeHref = items
    .filter((item) => isPathWithin(pathname, item.href))
    .sort((left, right) => right.href.length - left.href.length)[0]?.href;

  return items.map((item) => item.href === activeHref);
}
