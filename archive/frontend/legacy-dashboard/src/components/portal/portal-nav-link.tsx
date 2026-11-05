import { PORTAL_NAV_ICONS } from "@/components/common/sidebar/portal-nav-icons.constant";
import type { PortalNavigationIcon } from "@/config/routes.types";
import { cn } from "@/utils/cn.util";
import Link from "next/link";

interface PortalNavLinkProps {
  collapsed?: boolean;
  href: string;
  icon: PortalNavigationIcon;
  label: string;
  isActive: boolean;
  onNavigate?: () => void;
}

export function PortalNavLink({
  collapsed = false,
  href,
  icon,
  label,
  isActive,
  onNavigate,
}: PortalNavLinkProps) {
  const Icon = PORTAL_NAV_ICONS[icon];

  return (
    <Link
      href={href}
      onClick={onNavigate}
      aria-current={isActive ? "page" : undefined}
      title={collapsed ? label : undefined}
      className={cn(
        "flex items-center gap-3 rounded-lg px-3 py-2.5 text-sm font-medium transition-colors focus-visible:ring-2 focus-visible:ring-primary-500",
        collapsed &&
          "justify-center px-2 xl:group-hover/sidebar:justify-start xl:group-hover/sidebar:px-3",
        isActive
          ? "bg-sidebar-navigation-nav-item-nav-hover-background text-text-primary"
          : "text-text-secondary hover:bg-sidebar-navigation-nav-item-nav-hover-background hover:text-text-primary",
      )}
    >
      <Icon />
      <span className={cn(collapsed && "hidden xl:group-hover/sidebar:inline")}>
        {label}
      </span>
    </Link>
  );
}
