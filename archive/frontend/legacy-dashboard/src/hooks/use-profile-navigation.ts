"use client";

import {
  getProfileBreadcrumbs,
  getProfileTabs,
} from "@/config/profile-ui.util";
import { useDictionary } from "@/hooks/use-dictionary";
import { usePathname } from "next/navigation";
import { useSession } from "@/hooks/use-session";

export function useProfileNavigation() {
  const pathname = usePathname();
  const dictionary = useDictionary();
  const session = useSession();

  return {
    copy: dictionary.profile,
    breadcrumbs: getProfileBreadcrumbs(session.actor, dictionary),
    tabs: getProfileTabs(session.actor).map((tab) => ({
      ...tab,
      copy: dictionary.profile.tabs[tab.tab],
      isActive: pathname === tab.href,
    })),
  };
}
