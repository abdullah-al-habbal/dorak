import { AuthActor } from "@/enums/auth-actor.enum";
import { HttpMethod } from "@/enums/http-method.enum";
import type { ProxyRule } from "@/interfaces/proxy-rule.interface";

const OPERATIONS: readonly AuthActor[] = [AuthActor.Admin, AuthActor.Manager, AuthActor.Owner];
const EARNINGS: readonly AuthActor[] = [AuthActor.Manager, AuthActor.Barber, AuthActor.Owner];
const BRANDS: readonly AuthActor[] = [AuthActor.Admin, AuthActor.Owner];
const BARBER_ONLY: readonly AuthActor[] = [AuthActor.Barber];
const ADMIN_ONLY: readonly AuthActor[] = [AuthActor.Admin];
const OWNER_ONLY: readonly AuthActor[] = [AuthActor.Owner];
const EVERY_ACTOR: readonly AuthActor[] = [AuthActor.Admin, AuthActor.Manager, AuthActor.Barber, AuthActor.Owner];
const ID = "[^/]+";

// Default deny. Paths are the real backend dashboard paths, with no renaming.
// Guards mirror DashboardOperations/EarningsAuthorizationMiddleware; the backend stays the authority.
export const PROXY_ALLOW_LIST: readonly ProxyRule[] = [
  // The account page (NS-02): every actor manages only their own profile; the backend resolves "own" from the session.
  // `profile/password` is not here: it goes through /api/auth/password/change, which adds the session's refresh token.
  { methods: [HttpMethod.Get, HttpMethod.Patch], pattern: /^(profile|profile\/notifications|settings)$/, guards: EVERY_ACTOR },
  { methods: [HttpMethod.Post], pattern: /^profile\/email\/(change|verify)$/, guards: EVERY_ACTOR },
  { methods: [HttpMethod.Get], pattern: /^overview$/, guards: OPERATIONS },
  { methods: [HttpMethod.Get], pattern: new RegExp(`^bookings(/${ID}(/history)?)?$`), guards: OPERATIONS },
  { methods: [HttpMethod.Post], pattern: new RegExp(`^bookings/(walk-in|${ID}/review)$`), guards: OPERATIONS },
  { methods: [HttpMethod.Patch], pattern: new RegExp(`^bookings/${ID}(/(cancel|reschedule))?$`), guards: OPERATIONS },
  { methods: [HttpMethod.Get], pattern: new RegExp(`^branches(/${ID})?$`), guards: OPERATIONS },
  { methods: [HttpMethod.Put], pattern: new RegExp(`^branches/${ID}$`), guards: OPERATIONS },
  // Creating and deleting a branch is for platform admins and brand owners; the backend refuses a manager too.
  { methods: [HttpMethod.Post], pattern: /^branches$/, guards: BRANDS },
  { methods: [HttpMethod.Delete], pattern: new RegExp(`^branches/${ID}$`), guards: BRANDS },
  // The brand pickers and the admin approval list (owners get only their brands).
  { methods: [HttpMethod.Get], pattern: /^brands$/, guards: BRANDS },
  // Brand approval: the detail read and the approve action. Admin only; the backend re-checks through `BrandPolicy`.
  { methods: [HttpMethod.Get], pattern: new RegExp(`^brands/${ID}$`), guards: ADMIN_ONLY },
  { methods: [HttpMethod.Patch], pattern: new RegExp(`^admin/brands/${ID}/approve$`), guards: ADMIN_ONLY },
  { methods: [HttpMethod.Get, HttpMethod.Put], pattern: new RegExp(`^branches/${ID}/opening-hours$`), guards: OPERATIONS },
  { methods: [HttpMethod.Get], pattern: new RegExp(`^branches/${ID}/reviews$`), guards: OPERATIONS },
  { methods: [HttpMethod.Get], pattern: /^(payouts|subscription)$/, guards: OWNER_ONLY },
  // NS-30 barber review: the queue, the detail, approve and reject. Admin only; the backend re-checks.
  { methods: [HttpMethod.Get], pattern: new RegExp(`^admin/barbers(/${ID})?$`), guards: ADMIN_ONLY },
  { methods: [HttpMethod.Patch], pattern: new RegExp(`^admin/barbers/${ID}/(approve|reject)$`), guards: ADMIN_ONLY },
  // Platform billing (Module 9): payout approvals, plans and brand subscriptions. Admin only; the backend re-checks.
  { methods: [HttpMethod.Get], pattern: /^admin\/(payouts|subscription-plans|subscriptions|plan-feature-keys)$/, guards: ADMIN_ONLY },
  { methods: [HttpMethod.Post], pattern: /^admin\/(payouts\/generate|subscription-plans|subscriptions)$/, guards: ADMIN_ONLY },
  { methods: [HttpMethod.Put, HttpMethod.Delete], pattern: new RegExp(`^admin/subscription-plans/${ID}$`), guards: ADMIN_ONLY },
  { methods: [HttpMethod.Patch], pattern: new RegExp(`^admin/payouts/${ID}/(approve|mark-paid|cancel)$`), guards: ADMIN_ONLY },
  { methods: [HttpMethod.Patch], pattern: new RegExp(`^admin/subscriptions/${ID}/status$`), guards: ADMIN_ONLY },
  // Platform analytics and settings (Module 10). Admin only; the backend re-checks.
  { methods: [HttpMethod.Get], pattern: /^admin\/(analytics\/overview|settings)$/, guards: ADMIN_ONLY },
  { methods: [HttpMethod.Patch], pattern: /^admin\/settings$/, guards: ADMIN_ONLY },
  // Global catalog (Module 12): categories are managed here; catalog items are read only (edited in Filament). Admin only; the backend re-checks.
  { methods: [HttpMethod.Get, HttpMethod.Post], pattern: /^admin\/catalog-categories$/, guards: ADMIN_ONLY },
  { methods: [HttpMethod.Put, HttpMethod.Delete], pattern: new RegExp(`^admin/catalog-categories/${ID}$`), guards: ADMIN_ONLY },
  { methods: [HttpMethod.Patch], pattern: new RegExp(`^admin/catalog-categories/${ID}/active$`), guards: ADMIN_ONLY },
  { methods: [HttpMethod.Get], pattern: /^admin\/catalog-items$/, guards: ADMIN_ONLY },
  // The barber portal: the Operations routes reject barbers, so these are their own read-only endpoints.
  { methods: [HttpMethod.Get], pattern: /^schedule\/(appointments|hours)$/, guards: BARBER_ONLY },
  { methods: [HttpMethod.Get], pattern: /^earnings$/, guards: EARNINGS },
  {
    methods: [HttpMethod.Get, HttpMethod.Post, HttpMethod.Put, HttpMethod.Delete],
    pattern: new RegExp(`^(services|stylists)(/${ID})?$`),
    guards: OPERATIONS,
  },
  { methods: [HttpMethod.Patch], pattern: new RegExp(`^stylists/${ID}/(activate|deactivate)$`), guards: OPERATIONS },
  { methods: [HttpMethod.Get], pattern: /^currencies$/, guards: OPERATIONS },
  {
    methods: [HttpMethod.Get, HttpMethod.Post, HttpMethod.Put, HttpMethod.Delete],
    pattern: new RegExp(`^chairs(/${ID})?$`),
    guards: OPERATIONS,
  },
  { methods: [HttpMethod.Get, HttpMethod.Post], pattern: /^service-categories$/, guards: OPERATIONS },
];
