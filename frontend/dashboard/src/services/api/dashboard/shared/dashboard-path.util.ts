const DASHBOARD_PROXY_ROUTE_RULES: ReadonlyArray<{
  method: string;
  path: RegExp;
}> = [
  { method: "GET", path: /^overview$/ },
  { method: "GET", path: /^bookings$/ },
  { method: "POST", path: /^bookings\/walk-in$/ },
  { method: "GET", path: /^bookings\/[A-Za-z0-9-]+$/ },
  { method: "PATCH", path: /^bookings\/[A-Za-z0-9-]+$/ },
  { method: "PATCH", path: /^bookings\/[A-Za-z0-9-]+\/(cancel|reschedule)$/ },
  { method: "GET", path: /^bookings\/[A-Za-z0-9-]+\/history$/ },
  { method: "POST", path: /^bookings\/[A-Za-z0-9-]+\/review$/ },
  ...["branches", "chairs", "services", "stylists"].flatMap((root) => [
    { method: "GET", path: new RegExp(`^${root}$`) },
    { method: "POST", path: new RegExp(`^${root}$`) },
    { method: "GET", path: new RegExp(`^${root}/[A-Za-z0-9-]+$`) },
    { method: "PUT", path: new RegExp(`^${root}/[A-Za-z0-9-]+$`) },
    { method: "DELETE", path: new RegExp(`^${root}/[A-Za-z0-9-]+$`) },
  ]),
  { method: "GET", path: /^branches\/[A-Za-z0-9-]+\/floor-plan$/ },
  { method: "PATCH", path: /^branches\/[A-Za-z0-9-]+\/floor-plan$/ },
  { method: "GET", path: /^branches\/[A-Za-z0-9-]+\/reviews$/ },
  { method: "GET", path: /^branches\/[A-Za-z0-9-]+\/affiliations$/ },
  { method: "POST", path: /^branches\/[A-Za-z0-9-]+\/affiliations$/ },
  {
    method: "POST",
    path: /^branches\/[A-Za-z0-9-]+\/affiliations\/[A-Za-z0-9-]+\/(accept|reject|terminate)$/,
  },
  { method: "GET", path: /^branches\/[A-Za-z0-9-]+\/job-postings$/ },
  { method: "POST", path: /^branches\/[A-Za-z0-9-]+\/job-postings$/ },
  {
    method: "PUT",
    path: /^branches\/[A-Za-z0-9-]+\/job-postings\/[A-Za-z0-9-]+$/,
  },
  {
    method: "DELETE",
    path: /^branches\/[A-Za-z0-9-]+\/job-postings\/[A-Za-z0-9-]+$/,
  },
  {
    method: "GET",
    path: /^branches\/[A-Za-z0-9-]+\/job-postings\/[A-Za-z0-9-]+\/applications$/,
  },
  {
    method: "PATCH",
    path: /^branches\/[A-Za-z0-9-]+\/job-postings\/[A-Za-z0-9-]+\/applications\/[A-Za-z0-9-]+\/status$/,
  },
  {
    method: "PATCH",
    path: /^stylists\/[A-Za-z0-9-]+\/(activate|deactivate)$/,
  },
  { method: "GET", path: /^admin\/reviews$/ },
  {
    method: "PATCH",
    path: /^admin\/reviews\/[A-Za-z0-9-]+\/resolve$/,
  },
  { method: "GET", path: /^admin\/exchange-rates$/ },
  { method: "GET", path: /^admin\/catalog-(categories|tags)$/ },
  { method: "GET", path: /^admin\/catalog-items$/ },
  { method: "POST", path: /^admin\/catalog-items$/ },
  { method: "PUT", path: /^admin\/catalog-items\/[A-Za-z0-9-]+$/ },
  { method: "DELETE", path: /^admin\/catalog-items\/[A-Za-z0-9-]+$/ },
  {
    method: "GET",
    path: /^admin\/(subscription-plans|subscriptions|payment-gateways|commission-rules|commission-entries|payouts)$/,
  },
  {
    method: "POST",
    path: /^admin\/(subscription-plans|subscriptions|payment-gateways|commission-rules)$/,
  },
  { method: "GET", path: /^admin\/(plan-feature-keys|analytics\/overview)$/ },
  { method: "POST", path: /^admin\/payouts\/generate$/ },
  { method: "GET", path: /^admin\/payouts\/[A-Za-z0-9-]+$/ },
  {
    method: "PATCH",
    path: /^admin\/payouts\/[A-Za-z0-9-]+\/(approve|mark-paid|cancel)$/,
  },
  { method: "PATCH", path: /^admin\/subscriptions\/[A-Za-z0-9-]+\/status$/ },
  { method: "PATCH", path: /^admin\/payment-gateways\/[A-Za-z0-9-]+\/active$/ },
  { method: "GET", path: /^admin\/subscription-plans\/[A-Za-z0-9-]+$/ },
  {
    method: "PUT",
    path: /^admin\/(subscription-plans|payment-gateways|commission-rules)\/[A-Za-z0-9-]+$/,
  },
  {
    method: "DELETE",
    path: /^admin\/(subscription-plans|payment-gateways|commission-rules)\/[A-Za-z0-9-]+$/,
  },
  { method: "GET", path: /^brands$/ },
  { method: "POST", path: /^brands$/ },
  { method: "GET", path: /^brands\/[A-Za-z0-9-]+$/ },
  { method: "PUT", path: /^brands\/[A-Za-z0-9-]+$/ },
  { method: "GET", path: /^profile$/ },
  { method: "PATCH", path: /^profile$/ },
  { method: "POST", path: /^profile\/email\/(change|verify)$/ },
  { method: "PUT", path: /^profile\/password$/ },
  { method: "GET", path: /^profile\/notifications$/ },
  { method: "PATCH", path: /^profile\/notifications$/ },
  { method: "GET", path: /^settings$/ },
  { method: "PATCH", path: /^settings$/ },
];

export function isDashboardRouteAllowed(
  method: string,
  path: readonly string[],
): boolean {
  const joined = path.join("/");
  return DASHBOARD_PROXY_ROUTE_RULES.some(
    (rule) => rule.method === method.toUpperCase() && rule.path.test(joined),
  );
}

const DASHBOARD_PAGED_ADMIN_LISTS = [
  "reviews",
  "catalog-items",
  "subscription-plans",
  "subscriptions",
  "commission-rules",
  "commission-entries",
  "payouts",
];
const DASHBOARD_PAGED_BRANCH_SUBRESOURCES = [
  "reviews",
  "affiliations",
  "job-postings",
];

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
