import type { IconComponent } from "@/components/common/icon.types";
import { HomeIcon, UserIcon } from "@/components/common/sidebar/icons";
import type { PortalNavigationIcon } from "@/config/routes.types";

export const PORTAL_NAV_ICONS = {
  home: HomeIcon,
  user: UserIcon,
} as const satisfies Record<PortalNavigationIcon, IconComponent>;
