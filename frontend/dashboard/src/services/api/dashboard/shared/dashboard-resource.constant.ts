export const DASHBOARD_RESOURCES = [
  "overview",
  "branches",
  "chairs",
  "services",
  "stylists",
  "bookings",
] as const;

/** Dashboard BFF route roots. Includes non-entity account endpoints. */
export const DASHBOARD_PROXY_ROOTS = [
  ...DASHBOARD_RESOURCES,
  "profile",
] as const;
