"use client";

import { MenuIcon } from "@/components/common/header/icons";
import { LocaleToggle } from "@/components/common/header/locale-toggle";
import { ThemeToggle } from "@/components/common/header/theme-toggle";
import { Button } from "@/components/tailgrids/core/button";
import { PortalUserMenu } from "@/components/portal/portal-user-menu";
import { ChevronLeft, ChevronRight } from "@tailgrids/icons";
import { useDictionary } from "@/hooks/use-dictionary";
import { useSession } from "@/hooks/use-session";

interface PortalHeaderProps {
  isSidebarCollapsed: boolean;
  title: string;
  onOpenNavigation: () => void;
  onToggleSidebar: () => void;
}

export function PortalHeader({ isSidebarCollapsed, title, onOpenNavigation, onToggleSidebar }: PortalHeaderProps) {
  const dictionary = useDictionary();
  const session = useSession();

  return (
    <header className="sticky top-0 z-30 flex min-h-16 items-center justify-between gap-3 border-b border-card-border bg-card-surface-area px-4 py-3 sm:px-6">
      <div className="flex min-w-0 items-center gap-3">
        <Button
          iconOnly
          appearance="outline"
          onPress={onOpenNavigation}
          aria-label={dictionary.portal.openNavigation}
          className="xl:hidden"
        >
          <MenuIcon />
        </Button>
        <Button
          iconOnly
          appearance="outline"
          onPress={onToggleSidebar}
          aria-label={dictionary.common.sidebar.toggle}
          className="hidden xl:flex"
        >
          {isSidebarCollapsed ? <ChevronRight aria-hidden="true" /> : <ChevronLeft aria-hidden="true" />}
        </Button>
        <div className="min-w-0">
          <p className="truncate text-sm font-semibold text-text-primary">{title}</p>
          {session.displayName ? (
            <p className="truncate text-xs text-text-tertiary">{session.displayName}</p>
          ) : null}
        </div>
      </div>

      <div className="flex shrink-0 items-center gap-2">
        <div className="hidden items-center gap-2 sm:flex">
          <ThemeToggle />
          <LocaleToggle />
        </div>
        <PortalUserMenu />
      </div>
    </header>
  );
}
