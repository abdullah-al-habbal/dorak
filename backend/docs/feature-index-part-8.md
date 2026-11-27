---
nodeid: backend.feature-index.part-8
parentnode: backend.feature-index
childnodes: []
codeanchors:
  - backend/modules/
---

Part 8 of 8 · [Feature Index — Dorak Backend](feature-index.md) · [Previous](feature-index-part-7.md)

## Feature Registry

All backend features are built, tested, and passing; the sections above are the live contract. Pending work lives in the [backlog](../../docs/backlog/index.md).

### Barber panel (retired)
The barber web panel was retired with the other panels (NS-28); barbers use the stylist app and the light barber dashboard.

### Future Phases (not started)
See `docs/02-prd.md` §5 (phase roadmap) and §8 (locked implementation decisions) for remaining scope.

### Booking Engine Hardening (PRD §8 — Phase 1)
- Booking requests now require at least one active, duration-bearing service. The server derives and persists `ends_at`; chair and barber booking intervals are transactionally locked and may not overlap.
- At-home checkout requires GPS coordinates plus street, building, and unit text.
- Confirmed bookings may be cancelled only more than two hours before their start time.

### Dashboard Walk-in Operations
- `POST /api/v1/dashboard/bookings/walk-in` — dashboard-authenticated walk-in booking creation. It scopes the branch, chair, assigned stylist, and offered services before reusing the transactional booking overlap guard; a customer is found or created by email and the standard `BookingResource` contract is returned.
- Dashboard chair listings derive live availability from currently active confirmed/in-progress bookings, so the dashboard occupancy grid and mobile chair resource use the same status semantics.

### Dashboard Authorization and Email Change Verification
- Dashboard management endpoints now explicitly reject barber actors; self-service session and profile endpoints remain available to each dashboard actor.
- Branch managers can create, list, view, update, and delete branches within their current branch's brand; cross-brand access remains forbidden.
- `POST /api/v1/dashboard/profile/email/change` creates a short-lived pending email change and sends a six-digit confirmation code. `POST /api/v1/dashboard/profile/email/verify` applies the email only after successful verification; the existing verified email remains active until then.

### Barber Bio and Self-Service Barber Services (Task 54)
- `barbers.bio` (translatable json) is editable via `PATCH /api/v1/barber/profile` (`bio.en`/`bio.ar`) and exposed on the barber profile and explore barber detail payloads.
- `GET/POST /api/v1/barber/services`, `PUT/DELETE /api/v1/barber/services/{service}` — barber-scoped service CRUD; `serviceable_type`/`serviceable_id` are always forced server-side to the authenticated barber, never read from the request.
- D1 enforced: a service is owned by a Brand or a Barber, never a Branch. `branch` was removed from the dashboard `serviceable_type` enum; existing branch-owned `offered_services` rows were migrated to their parent brand. Branch managers still manage services, now classified as their branch's brand.

### Complete Affiliation Lifecycle (Task 55)
- A barber may hold several simultaneous pending/active affiliations across different branches/brands; only a duplicate pending/active affiliation to the *same* affiliable is rejected (409). `affiliable_id` must exist for its `affiliable_type` (422 otherwise).
- D11 (2026-11-13): while a brand is `pending`, `BrandStaffingGuard` refuses (403 `brand_not_approved`) creating, inviting and accepting an affiliation to the brand or any of its branches on every surface (barber app `POST /barbers/{barber}/affiliate` and `POST /affiliations/{id}/accept`, branch account API, dashboard); reject and terminate stay allowed. The dashboard affiliation and job-board routes accept the platform admin (audit actor `admin`).
- `POST /api/v1/branch/affiliations` lets a branch invite a barber directly (pending invite); the inviting branch cannot accept/reject its own invite (403).
- `POST /api/v1/affiliations/{affiliation}/terminate` (barber) and `POST /api/v1/branch/affiliations/{affiliation}/terminate` (branch) end an active affiliation, clearing `chairs.barber_id` for that barber at that branch. Future bookings are left untouched.
- Deleting a brand terminates every pending/active affiliation pointing at the brand or any of its branches before the cascade.
- The affiliation status enum was renamed `accepted` → `active` (enum, UI, and a backfill migration) to match the product spec's vocabulary.

### Dynamic Monetization (Task 65)
- Tables: `subscription_plans`, `plan_features`, `brand_subscriptions`, `payment_gateways`, `commission_rules`, `commission_entries`, `payouts`. Money is integer minor units plus `currency_code`; statuses are Backed Enums.
- Routes (dashboard `admin` group, platform admins only): `subscription-plans` CRUD, `plan-feature-keys`, `subscriptions` (list/assign/`PATCH {id}/status`), `payment-gateways` CRUD + `PATCH {id}/active`, `commission-rules` CRUD, `commission-entries`, `payouts` (list/show/`POST generate`/`PATCH {id}/approve|mark-paid|cancel`), `analytics/overview`.
- Assigning a plan sets the brand's Pennant flags from `plan_features`; commission accrues when a booking completes; `php artisan payouts:generate` creates draft payouts.
- Tests: `tests/Feature/Monetization/*`.

### Platform Settings (admin-editable limits)
- Table `platform_settings` (`key` unique, integer `value`); a missing row means the `SettingKey` default from `Modules\Settings\Constants\SettingsConstants` applies. `SettingsService::int(SettingKey)` is the single read path (overrides cached as one map, cleared on write).
- Routes (dashboard `admin` group, platform admins only, `PlatformSettingPolicy`): `GET /api/v1/dashboard/admin/settings` lists every key with value, default, min, max and group; `PATCH` takes `{settings: {key: int}}` validated against each key's bounds.
- Settings: upload sizes (portfolio, face photo), face photos per client, face-photo and notification retention, verification attempts and code TTLs (client email/phone/password reset, barber email, dashboard email change), dashboard session and refresh TTLs, minimum service duration, review dispute window, explore candidate cap, default/max page size, floor-plan limits. The old `DASHBOARD_CLAIM_TTL_SECONDS` / `DASHBOARD_REFRESH_TTL_SECONDS` env vars and `dashboard.dashboard.*_ttl_seconds` config keys are removed.
- Not dynamic by design: protocol/identity values (JWT algorithm and issuer, FCM URLs, header names, actor ids, basis-point denominator, earth radius). The subscription grace period is the `subscription_grace_days` setting (billing group): `brand_subscriptions.past_due_at` is stamped on `past_due`, `graceEndsAt()`/`isGraceExpired()` expose the window (also `grace_ends_at` in the admin resource), and the hourly `subscriptions:expire-past-due` command cancels expired subscriptions and revokes features.
- Migrations are flattened: every table has a single definitive `create_*_table` migration (no alter/backfill migrations); barbers and the service catalog creates were re-timestamped so their foreign-key targets exist first.
- Tests: `tests/Feature/Settings/*`. Dashboard: `/admin/settings` page (`components/platform-settings`).

## Strict enums, morph map & boolean naming
- `Relation::requireMorphMap()` is on; aliases come from enums implementing `Core\Contracts\MorphAliasEnum`, listed in `Core\Constants\MorphMapConstants::MORPH_ALIAS_ENUMS`. Every polymorphic `*_type` column is cast to its enum.
- Booleans renamed: `offered_services.is_active`/`is_at_home`, `barbers.is_workstation_online`, `preferences.allows_notifications`/`allows_dual_price_display` (API keys, dashboard and mobile DTOs follow).

## Dashboard audit register behavior (S2 to S14, 2026-11-15)
- **Lifecycle write guard (F-01):** `DashboardWriteGuard` is the single check for operational dashboard writes. A suspended brand or branch is read-only for owners and managers (403); pending and disabled branches stay writable; the platform admin bypasses it; booking cancellation and self-account writes skip it on purpose. `DashboardWriteExemptions::PENDING` is empty and `DashboardWriteGuardArchitectureTest` fails when a new write route is neither guarded nor exempt.
- **Sessions (F-01b, F-01c, F-05):** the dashboard session claim is mandatory and bound to the actor and token (`tid`), refresh revokes the previous claim durably, and login, refresh and requests share one liveness check (`DashboardActorLiveness`).
- **Catalog and services (F-02, F-07):** only the platform admin creates a global service category (`dashboard.serviceCategory.create`); brand services are written by the platform admin and the brand owner only, branch managers are read-only (`dashboard.service.write`).
- **Reference data (F-03, F-04):** `ActiveCurrencyRule` and `ActiveLanguageRule` reject retired currencies and inactive languages in new input; stored values stay readable.
- **Login limiter (F-09):** `/login` and `/owner/brand` use separate limiters.
- **Barber lookup (F-10):** `GET /dashboard/barber-lookup` matches names only. `POST /dashboard/branches/{branch}/affiliations/by-contact` (`contact`, optional `commission_percent`) resolves an exact email or phone on the server and always answers 202 with the same message, whether or not a barber matched or was already affiliated. Mobile routes and `InviteAffiliationRequest` are unchanged.
- **Policies (F-06):** every dashboard write that touches another actor's resource now calls `Gate::forUser($actor)->authorize(...)` after the scoped lookup (out-of-scope ids stay 404): `dashboard.booking.manage` (cancel, reschedule, status), `dashboard.stylist.create|manage`, `dashboard.branch.updateHours` (hours, hours exceptions, floor plan), `dashboard.staffing.manage` (job postings, applications, affiliations, invite by contact), `dashboard.brand.create|update`, `dashboard.branchLifecycle.suspend|switch`, plus the earlier chair, service, review and walk-in abilities. Self-account writes (profile, password, email change, notification preferences) act only on the authenticated actor and have no policy by design. Tests: `DashboardPoliciesTest` and the per-area Dashboard feature tests. The audit register was folded into `docs/backlog/index.md` on 2026-11-15; the slice-by-slice records are in Git history (`de6cff09:docs/audit-register/05-implementation-plan.md`).
- **Public profile pages (Track 2):** read-only, unauthenticated `GET /api/v1/public/brands/{slug}`, `/public/branches/{slug}` and `/public/stylists/{slug}` (`modules/Explore`, `Routes/Api/V1/public-profiles.php`, explore throttle). Slugs are `^[a-z0-9]+(-[a-z0-9]+)*$`; `branches.slug` and `barbers.slug` are new unique columns (migrations `2026_11_22_000001` and `000002`, backfilled from `name.en`, `-2`, `-3` on clashes, generated on create by `UniqueSlug`); brands already had one. A brand answers only when active, a branch only when discoverable (enabled, in an active brand), a stylist only when discoverable (not pending, disabled or banned); everything else is a 404. Answers carry no id, email, phone, status or stylist coordinates, and list only discoverable branches and active workplaces. Branch answers add `services` (the same menu rows as the app's branch detail, built by `Explore\Support\BranchMenu`, but rendered by `PublicServiceResource`: name, description, price, currency, duration, at-home flag and owner type, with no service, owner or catalog id and no brand override data; stylist answers use it too), `opening_hours` and `today_hours`; every translatable field is the full `{en, ar}` map. **Sitemap feed:** `GET /api/v1/public/sitemap` (same throttle, no auth) returns `{brands, branches, stylists}`, each a list of `{slug, updated_at}` for exactly the profiles the endpoints above would show (active brand, discoverable branch, discoverable stylist), ordered by slug and capped at `PublicProfileConstants::EXPLORE_SITEMAP_MAX_PER_KIND` (10,000) per kind; no id or private field. The dashboard's `sitemap.xml` reads it. Branch phone, social links, cover photo and gallery do not exist in the schema yet (backlog FT-23).
- **Translatable branch tags (Track 2):** `branches.tags` is a list of `{en, ar}` pairs instead of plain strings (migration `2026_11_22_000003` wraps stored strings as the same text in both languages; `down` unwraps). `branch/profile` and dashboard branch requests require `tags.*.en` and `tags.*.ar`; `BranchResource.tags` stays a `string[]` in the request language (mobile reads are unchanged); `BranchProfileResource.translations.tags` and the public branch answer carry the pairs. The business app now sends English and Arabic tag fields paired by position.
- **Branch tag search (Track 2):** `ExploreTextSearch::orMatchJsonList` matches the text of each tag (`JSON_SEARCH` over `$[*].*`, `!` escape), never the `en` and `ar` keys, so a query such as `en` no longer matches every tagged branch. Seeded branches carry `{en, ar}` tags (`BranchSeeder`, `E2eDashboardSeeder`); `SeededPublicProfileDataTest` checks seeded slugs and tags.
- **Dashboard locale on `/me` (Track 1):** dashboard routes apply the first supported `Accept-Language` over the stored preference (`ApplyPreferredLocaleMiddleware`, no guard), so `display_name` and other `{en, ar}` fields follow the page language; mobile guards keep the stored preference.
