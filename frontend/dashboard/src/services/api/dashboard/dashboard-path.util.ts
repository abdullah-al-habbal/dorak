const DASHBOARD_ROUTE_RULES: ReadonlyArray<{
  method: string;
  path: RegExp;
}> = [
  { method: "GET", path: /^overview$/ },
  { method: "GET", path: /^bookings$/ },
  { method: "POST", path: /^bookings\/walk-in$/ },
  { method: "GET", path: /^bookings\/[A-Za-z0-9-]+$/ },
  { method: "PATCH", path: /^bookings\/[A-Za-z0-9-]+$/ },
  { method: "PATCH", path: /^bookings\/[A-Za-z0-9-]+\/(cancel|reschedule)$/ },
  ...["branches", "chairs", "services", "stylists"].flatMap((root) => [
    { method: "GET", path: new RegExp(`^${root}$`) },
    { method: "POST", path: new RegExp(`^${root}$`) },
    { method: "GET", path: new RegExp(`^${root}/[A-Za-z0-9-]+$`) },
    { method: "PUT", path: new RegExp(`^${root}/[A-Za-z0-9-]+$`) },
    { method: "DELETE", path: new RegExp(`^${root}/[A-Za-z0-9-]+$`) },
  ]),
  { method: "GET", path: /^profile$/ },
  { method: "PATCH", path: /^profile$/ },
  { method: "POST", path: /^profile\/email\/(change|verify)$/ },
  { method: "PUT", path: /^profile\/password$/ },
  { method: "GET", path: /^profile\/notifications$/ },
  { method: "PATCH", path: /^profile\/notifications$/ },
];

export function isDashboardRouteAllowed(
  method: string,
  path: readonly string[],
): boolean {
  const joined = path.join("/");
  return DASHBOARD_ROUTE_RULES.some(
    (rule) => rule.method === method.toUpperCase() && rule.path.test(joined),
  );
}
