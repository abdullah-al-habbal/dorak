export const DASHBOARD_RESOURCES = [
  "overview",
  "branches",
  "chairs",
  "services",
  "stylists",
  "bookings",
] as const;

/**
 * Resources with free-text `search` support on the dashboard list endpoint.
 * Bookings has no free-text search; it gets dedicated status/date/chair/stylist
 * filters instead (see entity-list-page.tsx).
 */
export const DASHBOARD_RESOURCE_SEARCH_SUPPORT: Record<
  Exclude<(typeof DASHBOARD_RESOURCES)[number], "overview">,
  boolean
> = {
  branches: true,
  chairs: true,
  services: true,
  stylists: true,
  bookings: false,
};

/** Dashboard BFF route roots. Includes non-entity account endpoints. */
export const DASHBOARD_PROXY_ROOTS = [
  ...DASHBOARD_RESOURCES,
  "profile",
] as const;
