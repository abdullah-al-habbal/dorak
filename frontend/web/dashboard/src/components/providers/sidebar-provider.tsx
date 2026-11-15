"use client";

import { usePathname } from "next/navigation";
import { useMemo, useState } from "react";

import { SidebarContext } from "@/components/providers/sidebar-context";
import { SIDEBAR_COOKIE } from "@/config/cookies.constant";
import type { SidebarContextValue } from "@/interfaces/ui/sidebar-context-value.interface";
import type { SidebarProviderProps } from "@/interfaces/ui/sidebar-provider-props.interface";
import { writeClientCookie } from "@/lib/cookie.util";
import { serializeSidebarState } from "@/lib/sidebar.util";

export function SidebarProvider({ initialCollapsed, children }: SidebarProviderProps) {
  const pathname = usePathname();
  const [collapsed, setCollapsedState] = useState(initialCollapsed);
  // The sheet stores the path it was opened on, so navigating closes it without an effect.
  const [openedOn, setOpenedOn] = useState<string | null>(null);

  const value = useMemo<SidebarContextValue>(
    () => ({
      collapsed,
      mobileOpen: openedOn === pathname,
      setCollapsed: (next) => {
        writeClientCookie(SIDEBAR_COOKIE, serializeSidebarState(next));
        setCollapsedState(next);
      },
      setMobileOpen: (open) => setOpenedOn(open ? pathname : null),
    }),
    [collapsed, openedOn, pathname],
  );

  return <SidebarContext value={value}>{children}</SidebarContext>;
}
