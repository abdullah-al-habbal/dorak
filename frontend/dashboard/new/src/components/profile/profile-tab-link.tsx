import { PROFILE_TAB_ICONS } from "@/components/profile/profile-tab-icons.constant";
import type { ProfileTabIcon } from "@/config/profile-ui.types";
import Link from "next/link";

interface ProfileTabLinkProps {
  href: string;
  icon: ProfileTabIcon;
  title: string;
  description: string;
  isActive: boolean;
}

export function ProfileTabLink({ href, icon, title, description, isActive }: ProfileTabLinkProps) {
  const Icon = PROFILE_TAB_ICONS[icon];

  return (
    <Link
      href={href}
      data-active={isActive}
      className="flex w-full items-start justify-start gap-3 rounded-xl p-2 hover:bg-background-gray-secondary_alt/45 data-[active=true]:border-none data-[active=true]:bg-background-gray-secondary_alt"
    >
      <div className="flex size-11 shrink-0 items-center justify-center rounded-lg border border-border-secondary-alt bg-background-gray-secondary_alt text-icon-secondary">
        <Icon />
      </div>
      <div className="flex flex-col items-start gap-1">
        <span className="text-sm font-semibold text-text-primary">{title}</span>
        <span className="text-xs font-normal text-text-tertiary">{description}</span>
      </div>
    </Link>
  );
}
