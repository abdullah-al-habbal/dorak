export interface SidebarContextValue {
  /** Desktop rail collapsed state, persisted in a cookie. */
  collapsed: boolean;
  /** Mobile sheet state. It resets whenever the route changes. */
  mobileOpen: boolean;
  setCollapsed: (collapsed: boolean) => void;
  setMobileOpen: (open: boolean) => void;
}
