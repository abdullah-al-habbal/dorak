"use client";

import { Logo } from "@/components/common/brand/logo";
import { PortalNavLink } from "@/components/portal/portal-nav-link";
import { usePortalNavigation } from "@/hooks/use-portal-navigation";
import { cn } from "@/utils/cn.util";
import Link from "next/link";

interface PortalSidebarProps {
  collapsed?: boolean;
  onNavigate?: () => void;
}

export function PortalSidebar({ collapsed = false, onNavigate }: PortalSidebarProps) {
  const navigation = usePortalNavigation();

  return (
    <nav
      aria-label={navigation.label}
      className={cn(
        "flex h-full flex-col p-4 transition-[padding] duration-200",
        collapsed && "px-2 xl:group-hover/sidebar:px-4",
      )}
    >
      <Link
        href={navigation.homeHref}
        onClick={onNavigate}
        title={collapsed ? navigation.appName : undefined}
        className={cn("mb-8 inline-flex w-fit items-center gap-2", collapsed && "xl:group-hover/sidebar:gap-2")}
      >
        <Logo />
        <span className={cn("text-lg leading-none font-semibold tracking-tight", collapsed && "hidden xl:group-hover/sidebar:inline")}>
          {navigation.appName}
        </span>
      </Link>

      <div className="space-y-1">
        {navigation.items.map((item) => (
          <PortalNavLink
            key={item.key}
            href={item.href}
            icon={item.icon}
            label={item.label}
            isActive={item.isActive}
            collapsed={collapsed}
            onNavigate={onNavigate}
          />
        ))}
      </div>
    </nav>
  );
}
