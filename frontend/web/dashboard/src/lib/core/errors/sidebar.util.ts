const SIDEBAR_COLLAPSED_VALUE = "1";
const SIDEBAR_EXPANDED_VALUE = "0";

export function parseSidebarCookie(value: string | undefined): boolean {
  return value === SIDEBAR_COLLAPSED_VALUE;
}

export function serializeSidebarState(collapsed: boolean): string {
  return collapsed ? SIDEBAR_COLLAPSED_VALUE : SIDEBAR_EXPANDED_VALUE;
}
