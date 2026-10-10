"use client";

import { SheetContent, SheetOverlay, SheetTitle } from "@/components/tailgrids/core/sheet";
import { useMobileNavigation } from "@/hooks/use-mobile-navigation";
import { useDictionary } from "@/hooks/use-dictionary";
import { PortalHeader } from "@/components/portal/portal-header";
import { PortalSidebar } from "@/components/portal/portal-sidebar";
import { cn } from "@/utils/cn.util";
import { useState } from "react";

interface PortalShellProps {
  title: string;
  children: React.ReactNode;
}

export function PortalShell({ title, children }: PortalShellProps) {
  const mobileNavigation = useMobileNavigation();
  const dictionary = useDictionary();
  const sheetLabels = dictionary.common.sheet;
  const [isSidebarCollapsed, setIsSidebarCollapsed] = useState(false);

  return (
    <div className="min-h-full bg-background-gray-secondary_alt_2 xl:flex">
      <aside
        data-collapsed={isSidebarCollapsed}
        className={cn(
          "group/sidebar hidden shrink-0 border-e border-card-border bg-card-surface-area transition-[width] duration-200 ease-out xl:block",
          isSidebarCollapsed ? "w-20 hover:w-64" : "w-64",
        )}
      >
        <PortalSidebar collapsed={isSidebarCollapsed} />
      </aside>

      <SheetOverlay isOpen={mobileNavigation.isOpen} onOpenChange={mobileNavigation.setIsOpen}>
        <SheetContent side="start" showCloseButton={false} className="w-72 border-e border-card-border bg-card-surface-area p-0" labels={sheetLabels}>
          <SheetTitle className="sr-only">{dictionary.portal.closeNavigation}</SheetTitle>
          <PortalSidebar onNavigate={mobileNavigation.close} />
        </SheetContent>
      </SheetOverlay>

      <div className="flex min-h-screen min-w-0 flex-1 flex-col">
        <PortalHeader
          title={title}
          isSidebarCollapsed={isSidebarCollapsed}
          onOpenNavigation={mobileNavigation.open}
          onToggleSidebar={() => setIsSidebarCollapsed((collapsed) => !collapsed)}
        />
        <main className="flex-1 p-4 sm:p-6 xl:p-8">
          <div className="mx-auto w-full max-w-384">{children}</div>
        </main>
      </div>
    </div>
  );
}
