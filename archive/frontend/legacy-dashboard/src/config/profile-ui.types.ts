import type { Dictionary } from "@/i18n/dictionary.types";
import type { PROFILE_TABS } from "@/config/profile-ui.constant";
import type { ActorHrefItem } from "@/config/routes.types";

export type ProfileTabKey = keyof Dictionary["profile"]["tabs"];

export type ProfileTabIcon = "user";

/** Tabs actually enabled in `PROFILE_TABS` (a subset of the dictionary tab copy). */
export type ProfilePageKey = (typeof PROFILE_TABS)[number]["tab"];

export interface ProfileTabConfig extends ActorHrefItem {
  tab: ProfileTabKey;
  icon: ProfileTabIcon;
}

export interface Breadcrumb {
  href: string;
  label: string;
}
