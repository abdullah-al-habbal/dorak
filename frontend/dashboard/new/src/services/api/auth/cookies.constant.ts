export const COOKIE_NAMES = {
  claim: process.env.DASHBOARD_CLAIM_COOKIE ?? "dashboard_claim",
  access: process.env.DASHBOARD_ACCESS_COOKIE ?? "dashboard_access",
  refresh: process.env.DASHBOARD_REFRESH_COOKIE ?? "dashboard_refresh",
} as const;
