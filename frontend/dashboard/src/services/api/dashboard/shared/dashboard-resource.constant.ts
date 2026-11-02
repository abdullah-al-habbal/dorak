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
 * Bookings search matches the client name only (not email); status/date/chair/
 * stylist have dedicated filters (see entity-list-page.tsx).
 */
export const DASHBOARD_RESOURCE_SEARCH_SUPPORT: Record<
  Exclude<(typeof DASHBOARD_RESOURCES)[number], "overview">,
  boolean
> = {
  branches: true,
  chairs: true,
  services: true,
  stylists: true,
  bookings: true,
};

/** Dashboard BFF route roots. Includes non-entity account endpoints. */
export const DASHBOARD_PROXY_ROOTS = [
  ...DASHBOARD_RESOURCES,
  "profile",
] as const;
