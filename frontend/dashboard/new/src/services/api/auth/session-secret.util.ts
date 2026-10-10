/** Shared HS256 secret for dashboard claim cookies. Empty string fails verification closed. */
export function getSessionSecret(): string {
  return process.env.DASHBOARD_SESSION_SECRET ?? "";
}
