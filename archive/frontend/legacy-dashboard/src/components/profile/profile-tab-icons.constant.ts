import type { IconComponent } from "@/components/common/icon.types";
import { UserIcon } from "@/components/profile/icons";
import type { ProfileTabIcon } from "@/config/profile-ui.types";

export const PROFILE_TAB_ICONS = { user: UserIcon } as const satisfies Record<
  ProfileTabIcon,
  IconComponent
>;
