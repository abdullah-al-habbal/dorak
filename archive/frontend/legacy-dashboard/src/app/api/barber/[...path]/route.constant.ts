export const BARBER_PROXY_ROUTE_RULES: ReadonlyArray<{
  method: string;
  path: RegExp;
}> = [
  { method: "GET", path: /^profile$/ },
  { method: "PATCH", path: /^profile$/ },
  { method: "GET", path: /^portfolio$/ },
  { method: "POST", path: /^portfolio$/ },
  { method: "DELETE", path: /^portfolio\/[A-Za-z0-9-]+$/ },
  { method: "GET", path: /^schedule$/ },
  { method: "PATCH", path: /^schedule$/ },
  { method: "GET", path: /^appointments\/today$/ },
  { method: "PATCH", path: /^travel-radius$/ },
  { method: "PATCH", path: /^workstation-status$/ },
  {
    method: "PATCH",
    path: /^bookings\/[A-Za-z0-9-]+\/(accept|start|complete|no-show)$/,
  },
  { method: "POST", path: /^bookings\/[A-Za-z0-9-]+\/cancel$/ },
];
