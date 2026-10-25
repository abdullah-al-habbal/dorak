const NOTIFICATION_ROUTE_RULES: ReadonlyArray<{
  method: string;
  path: RegExp;
}> = [
  { method: "GET", path: /^$/ },
  { method: "POST", path: /^read-all$/ },
  {
    method: "PATCH",
    path: /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}\/read$/i,
  },
];

export function isNotificationRouteAllowed(
  method: string,
  path: string,
): boolean {
  return NOTIFICATION_ROUTE_RULES.some(
    (rule) => rule.method === method && rule.path.test(path),
  );
}
