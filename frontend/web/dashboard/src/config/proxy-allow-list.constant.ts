import { AuthActor } from "@/enums/auth-actor.enum";
import { HttpMethod } from "@/enums/http-method.enum";
import type { ProxyRule } from "@/interfaces/proxy-rule.interface";

const OPERATIONS: readonly AuthActor[] = [AuthActor.Admin, AuthActor.Manager, AuthActor.Owner];
const EARNINGS: readonly AuthActor[] = [AuthActor.Manager, AuthActor.Barber, AuthActor.Owner];
const ID = "[^/]+";

// Default deny. Paths are the real backend dashboard paths, with no renaming.
// Guards mirror DashboardOperations/EarningsAuthorizationMiddleware; the backend stays the authority.
export const PROXY_ALLOW_LIST: readonly ProxyRule[] = [
  { methods: [HttpMethod.Get], pattern: /^overview$/, guards: OPERATIONS },
  { methods: [HttpMethod.Get], pattern: new RegExp(`^bookings(/${ID}(/history)?)?$`), guards: OPERATIONS },
  { methods: [HttpMethod.Post], pattern: new RegExp(`^bookings/(walk-in|${ID}/review)$`), guards: OPERATIONS },
  { methods: [HttpMethod.Patch], pattern: new RegExp(`^bookings/${ID}(/(cancel|reschedule))?$`), guards: OPERATIONS },
  { methods: [HttpMethod.Get], pattern: new RegExp(`^branches(/${ID})?$`), guards: OPERATIONS },
  { methods: [HttpMethod.Put], pattern: new RegExp(`^branches/${ID}$`), guards: OPERATIONS },
  { methods: [HttpMethod.Get, HttpMethod.Put], pattern: new RegExp(`^branches/${ID}/opening-hours$`), guards: OPERATIONS },
  { methods: [HttpMethod.Get], pattern: /^earnings$/, guards: EARNINGS },
  {
    methods: [HttpMethod.Get, HttpMethod.Post, HttpMethod.Put, HttpMethod.Delete],
    pattern: new RegExp(`^(services|stylists)(/${ID})?$`),
    guards: OPERATIONS,
  },
  { methods: [HttpMethod.Patch], pattern: new RegExp(`^stylists/${ID}/(activate|deactivate)$`), guards: OPERATIONS },
  { methods: [HttpMethod.Get], pattern: /^(chairs|currencies)$/, guards: OPERATIONS },
  { methods: [HttpMethod.Get, HttpMethod.Post], pattern: /^service-categories$/, guards: OPERATIONS },
];
