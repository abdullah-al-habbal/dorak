import {
  DASHBOARD_PAGED_ADMIN_LISTS,
  DASHBOARD_PAGED_BRANCH_SUBRESOURCES,
  DASHBOARD_PROXY_ROUTE_RULES,
} from "@/services/api/dashboard/shared/dashboard-path.constant";

export function isDashboardRouteAllowed(
  method: string,
  path: readonly string[],
): boolean {
  const joined = path.join("/");
  return DASHBOARD_PROXY_ROUTE_RULES.some(
    (rule) => rule.method === method.toUpperCase() && rule.path.test(joined),
  );
}

/** Whether a proxied list response carries backend pagination meta. */
export function isDashboardPagedPath(path: readonly string[]): boolean {
  if (path.length === 1) return path[0] !== "overview";
  if (path[0] === "admin")
    return (
      path.length === 2 && DASHBOARD_PAGED_ADMIN_LISTS.includes(path[1] ?? "")
    );
  if (path[0] !== "branches") return false;
  if (path.length === 3)
    return DASHBOARD_PAGED_BRANCH_SUBRESOURCES.includes(path[2] ?? "");
  return path.length === 5 && path[4] === "applications";
}
