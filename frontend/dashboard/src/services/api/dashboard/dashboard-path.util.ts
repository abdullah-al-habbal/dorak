import { isOneOf } from "@/utils/guards.util";
import { DASHBOARD_PROXY_ROOTS } from "@/services/api/dashboard/dashboard-resource.constant";

const ID_SEGMENT = /^[A-Za-z0-9-]+$/;

/** Accept only documented dashboard endpoints; never turn BFF into an open proxy. */
export function isDashboardResourcePath(path: readonly string[]): boolean {
  if (path.length === 1) return isOneOf(DASHBOARD_PROXY_ROOTS, path[0]);
  if (
    !isOneOf(DASHBOARD_PROXY_ROOTS, path[0]) ||
    !path.every((segment) => ID_SEGMENT.test(segment))
  )
    return false;

  return (
    (path[0] !== "overview" && path.length === 2) ||
    (path[0] === "profile" &&
      path.length === 2 &&
      ["password", "notifications"].includes(path[1])) ||
    (path[0] === "profile" &&
      path.length === 3 &&
      path[1] === "email" &&
      ["change", "verify"].includes(path[2])) ||
    (path[0] === "bookings" && path.length === 2 && path[1] === "walk-in") ||
    (path[0] === "bookings" &&
      path.length === 3 &&
      ["cancel", "reschedule"].includes(path[2]))
  );
}
