import type { ReactNode } from "react";

export interface SidebarProviderProps {
  /** Read from the sidebar cookie on the server, so the first paint matches. */
  initialCollapsed: boolean;
  children: ReactNode;
}
