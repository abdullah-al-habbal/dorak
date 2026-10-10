"use client";

import { ROUTES } from "@/config/routes.constant";
import { getActivePortalNavigation, getPortalNavigation } from "@/config/routes.util";
import { useDictionary } from "@/hooks/use-dictionary";
import { useSession } from "@/hooks/use-session";
import { usePathname } from "next/navigation";

export function usePortalNavigation() {
  const session = useSession();
  const pathname = usePathname();
  const dictionary = useDictionary();

  const items = getPortalNavigation(session.actor, session.permissions);
  const activeItems = getActivePortalNavigation(items, pathname);

  return {
    label: dictionary.portal.navigationLabel,
    appName: dictionary.meta.appName,
    homeHref: ROUTES.portal[session.actor].root,
    items: items.map((item, index) => ({
      ...item,
      label: dictionary.common.nav[item.key],
      isActive: activeItems[index],
    })),
  };
}
