import { create } from "zustand";

import { SIDEBAR_COOKIE } from "@/config/cookies.constant";
import type { SidebarState } from "@/interfaces/sidebar-state.interface";
import { writeClientCookie } from "@/lib/cookie.util";

export const useSidebarStore = create<SidebarState>((set) => ({
  collapsed: false,
  mobileOpen: false,
  setCollapsed: (collapsed) => {
    writeClientCookie(SIDEBAR_COOKIE, collapsed ? "1" : "0");
    set({ collapsed });
  },
  setMobileOpen: (mobileOpen) => set({ mobileOpen }),
}));
