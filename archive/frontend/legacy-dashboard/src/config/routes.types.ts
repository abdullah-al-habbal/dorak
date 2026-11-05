import type { Dictionary } from "@/i18n/dictionary.types";
import type { AuthActor } from "@/services/api/auth/types/auth.types";

export interface PortalRouteConfig {
  root: string;
  login: string;
  profile: {
    root: string;
    account: string;
    security: string;
    notification: string;
    settings: string;
  };
  copy: {
    publicLabel: keyof Dictionary["public"];
    authTitle: keyof Dictionary["auth"];
    portalTitle: keyof Dictionary["portal"];
  };
}

export type PortalNavigationKey = keyof Dictionary["common"]["nav"];

export type PortalNavigationIcon =
  | "briefcase"
  | "building"
  | "calendar"
  | "card"
  | "chart"
  | "file"
  | "gear"
  | "globe"
  | "home"
  | "layers"
  | "layout"
  | "map"
  | "message"
  | "shop"
  | "sliders"
  | "star"
  | "team"
  | "user"
  | "wallet";

/** Any navigation config entry whose destination depends on the viewing actor. */
export interface ActorHrefItem {
  href: (actor: AuthActor) => string;
}

export interface PortalNavigationItem extends ActorHrefItem {
  key: PortalNavigationKey;
  icon: PortalNavigationIcon;
  actors: readonly AuthActor[];
  requiredPermissions?: readonly string[];
}
