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
  // NS-12 closure days and special hours.
  { methods: [HttpMethod.Get], pattern: new RegExp(`^branches/${ID}/hours-overrides$`), guards: OPERATIONS },
  { methods: [HttpMethod.Put, HttpMethod.Delete], pattern: new RegExp(`^branches/${ID}/hours-overrides/\\d{4}-\\d{2}-\\d{2}$`), guards: OPERATIONS },
  { methods: [HttpMethod.Get], pattern: new RegExp(`^branches/${ID}/reviews$`), guards: OPERATIONS },
  // NS-14: the shop flags a published review; the platform admin only judges disputes (NS-05).
  { methods: [HttpMethod.Post], pattern: new RegExp(`^branches/${ID}/reviews/${ID}/dispute$`), guards: [AuthActor.Manager, AuthActor.Owner] },
  { methods: [HttpMethod.Get], pattern: /^(payouts|subscription)$/, guards: OWNER_ONLY },
  // NS-30 barber review: the queue, the detail, approve and reject. Admin only; the backend re-checks.
  { methods: [HttpMethod.Get], pattern: new RegExp(`^admin/barbers(/${ID}(/(activation-log|affiliations))?)?$`), guards: ADMIN_ONLY },
  { methods: [HttpMethod.Post], pattern: new RegExp(`^admin/barbers/${ID}/ban$`), guards: ADMIN_ONLY },
  { methods: [HttpMethod.Patch], pattern: new RegExp(`^admin/barbers/${ID}/(approve|reject|activate|deactivate|unban)$`), guards: ADMIN_ONLY },
  // NS-10 notifications: every actor reads and clears only their own inbox; the backend scopes it to the session.
  { methods: [HttpMethod.Get], pattern: /^notifications$/, guards: EVERY_ACTOR },
  { methods: [HttpMethod.Post], pattern: /^notifications\/read-all$/, guards: EVERY_ACTOR },
  { methods: [HttpMethod.Patch], pattern: new RegExp(`^notifications/${ID}/read$`), guards: EVERY_ACTOR },
  // NS-09 branch oversight: the admin reads a branch's job postings; NS-17 gives the branch teams the whole job board.
  { methods: [HttpMethod.Get], pattern: new RegExp(`^branches/${ID}/job-postings$`), guards: OPERATIONS },
  // NS-17 job board: a manager or owner posts vacancies, reads the applications and moves each one through its statuses.
  { methods: [HttpMethod.Post], pattern: new RegExp(`^branches/${ID}/job-postings$`), guards: [AuthActor.Manager, AuthActor.Owner] },
  { methods: [HttpMethod.Put, HttpMethod.Delete], pattern: new RegExp(`^branches/${ID}/job-postings/${ID}$`), guards: [AuthActor.Manager, AuthActor.Owner] },
  { methods: [HttpMethod.Get], pattern: new RegExp(`^branches/${ID}/job-postings/${ID}/applications$`), guards: [AuthActor.Manager, AuthActor.Owner] },
  { methods: [HttpMethod.Patch], pattern: new RegExp(`^branches/${ID}/job-postings/${ID}/applications/${ID}/status$`), guards: [AuthActor.Manager, AuthActor.Owner] },
  // NS-16 barber invitations: everyone with branch access reads; only the branch teams act (the admin has no stake in who works at a shop).
  { methods: [HttpMethod.Get], pattern: new RegExp(`^branches/${ID}/affiliations$`), guards: OPERATIONS },
  { methods: [HttpMethod.Get], pattern: /^barber-lookup$/, guards: [AuthActor.Manager, AuthActor.Owner] },
  { methods: [HttpMethod.Post], pattern: new RegExp(`^branches/${ID}/affiliations(/${ID}/(accept|reject|terminate))?$`), guards: [AuthActor.Manager, AuthActor.Owner] },
  // NS-18 per-brand stylist pricing: the brand owner sets a stylist's terms (the backend checks the stylist works for that brand).
  { methods: [HttpMethod.Get], pattern: new RegExp(`^barbers/${ID}/services$`), guards: [AuthActor.Owner] },
  { methods: [HttpMethod.Put, HttpMethod.Delete], pattern: new RegExp(`^barbers/${ID}/services/${ID}/override$`), guards: [AuthActor.Owner] },
  // NS-19 currencies and exchange rates (admin only); the plain `currencies` read above stays for the pickers.
  { methods: [HttpMethod.Get, HttpMethod.Post], pattern: /^admin\/(currencies|exchange-rates)$/, guards: ADMIN_ONLY },
  { methods: [HttpMethod.Put], pattern: new RegExp(`^admin/currencies/${ID}$`), guards: ADMIN_ONLY },
  { methods: [HttpMethod.Patch], pattern: new RegExp(`^admin/currencies/${ID}/active$`), guards: ADMIN_ONLY },
  { methods: [HttpMethod.Delete], pattern: new RegExp(`^admin/exchange-rates/${ID}$`), guards: ADMIN_ONLY },
  // NS-20 languages: the admin switches the existing languages on and off.
  { methods: [HttpMethod.Get], pattern: /^admin\/languages$/, guards: ADMIN_ONLY },
  { methods: [HttpMethod.Patch], pattern: new RegExp(`^admin/languages/${ID}/active$`), guards: ADMIN_ONLY },
  // NS-07 clients and bans (admin only).
  { methods: [HttpMethod.Get], pattern: new RegExp(`^admin/clients(/${ID}(/(bookings|reviews))?)?$`), guards: ADMIN_ONLY },
  { methods: [HttpMethod.Post], pattern: new RegExp(`^admin/clients/${ID}/ban$`), guards: ADMIN_ONLY },
  { methods: [HttpMethod.Patch], pattern: new RegExp(`^admin/clients/${ID}/unban$`), guards: ADMIN_ONLY },
  // NS-06 brand lifecycle: reject, suspend, reactivate, feature overrides, history (admin) and resubmit/edit (owner too).
  { methods: [HttpMethod.Patch], pattern: new RegExp(`^admin/brands/${ID}/(reject|suspend|reactivate|features)$`), guards: ADMIN_ONLY },
  { methods: [HttpMethod.Get], pattern: /^admin\/audit\/(brand|branch)\/[^/]+$/, guards: ADMIN_ONLY },
  { methods: [HttpMethod.Put], pattern: new RegExp(`^brands/${ID}$`), guards: BRANDS },
  { methods: [HttpMethod.Post], pattern: new RegExp(`^brands/${ID}/resubmit$`), guards: OWNER_ONLY },
  // NS-13: an existing owner adds another brand (it starts pending).
  { methods: [HttpMethod.Post], pattern: /^brands$/, guards: OWNER_ONLY },
  // NS-06 / D9 branch lifecycle: the owner and the branch's manager switch on or off, the admin suspends and reactivates.
  { methods: [HttpMethod.Patch], pattern: new RegExp(`^branches/${ID}/switch-(on|off)$`), guards: OPERATIONS },
  { methods: [HttpMethod.Patch], pattern: new RegExp(`^admin/branches/${ID}/(suspend|reactivate)$`), guards: ADMIN_ONLY },
  // NS-04 admin users: list, invite, edit, deactivate, reactivate, resend the invitation. Admin only; the backend re-checks.
  { methods: [HttpMethod.Get, HttpMethod.Post], pattern: /^admin\/admins$/, guards: ADMIN_ONLY },
  { methods: [HttpMethod.Put], pattern: new RegExp(`^admin/admins/${ID}$`), guards: ADMIN_ONLY },
  { methods: [HttpMethod.Patch], pattern: new RegExp(`^admin/admins/${ID}/(deactivate|reactivate)$`), guards: ADMIN_ONLY },
  { methods: [HttpMethod.Post], pattern: new RegExp(`^admin/admins/${ID}/resend-invite$`), guards: ADMIN_ONLY },
  // NS-05 review moderation: the disputed queue and the resolve action. Admin only; the backend re-checks.
  { methods: [HttpMethod.Get], pattern: /^admin\/reviews$/, guards: ADMIN_ONLY },
  { methods: [HttpMethod.Patch], pattern: new RegExp(`^admin/reviews/${ID}/resolve$`), guards: ADMIN_ONLY },
  // Platform billing (Module 9): payout approvals, plans and brand subscriptions. Admin only; the backend re-checks.
  { methods: [HttpMethod.Get], pattern: /^admin\/(payouts|subscription-plans|subscriptions|plan-feature-keys)$/, guards: ADMIN_ONLY },
  { methods: [HttpMethod.Post], pattern: /^admin\/(payouts\/generate|subscription-plans|subscriptions)$/, guards: ADMIN_ONLY },
  { methods: [HttpMethod.Put, HttpMethod.Delete], pattern: new RegExp(`^admin/subscription-plans/${ID}$`), guards: ADMIN_ONLY },
  { methods: [HttpMethod.Patch], pattern: new RegExp(`^admin/payouts/${ID}/(approve|mark-paid|cancel)$`), guards: ADMIN_ONLY },
  { methods: [HttpMethod.Patch], pattern: new RegExp(`^admin/subscriptions/${ID}/status$`), guards: ADMIN_ONLY },
  // Platform analytics and settings (Module 10). Admin only; the backend re-checks.
  { methods: [HttpMethod.Get], pattern: /^admin\/(analytics\/overview|settings)$/, guards: ADMIN_ONLY },
  { methods: [HttpMethod.Patch], pattern: /^admin\/settings$/, guards: ADMIN_ONLY },
  // Global catalog (Module 12): categories, items and tags are managed here. Admin only; the backend re-checks.
  { methods: [HttpMethod.Get, HttpMethod.Post], pattern: /^admin\/catalog-categories$/, guards: ADMIN_ONLY },
  { methods: [HttpMethod.Put, HttpMethod.Delete], pattern: new RegExp(`^admin/catalog-categories/${ID}$`), guards: ADMIN_ONLY },
  { methods: [HttpMethod.Patch], pattern: new RegExp(`^admin/catalog-categories/${ID}/active$`), guards: ADMIN_ONLY },
  { methods: [HttpMethod.Get, HttpMethod.Post], pattern: /^admin\/catalog-items$/, guards: ADMIN_ONLY },
  { methods: [HttpMethod.Put, HttpMethod.Delete], pattern: new RegExp(`^admin/catalog-items/${ID}$`), guards: ADMIN_ONLY },
  // NS-21 catalog tags (admin only).
  { methods: [HttpMethod.Get, HttpMethod.Post], pattern: /^admin\/catalog-tags$/, guards: ADMIN_ONLY },
  { methods: [HttpMethod.Put, HttpMethod.Delete], pattern: new RegExp(`^admin/catalog-tags/${ID}$`), guards: ADMIN_ONLY },
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
  // NS-15 floor plan editor.
  { methods: [HttpMethod.Get, HttpMethod.Patch], pattern: new RegExp(`^branches/${ID}/floor-plan$`), guards: OPERATIONS },
];
