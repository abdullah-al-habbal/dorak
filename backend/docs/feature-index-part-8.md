---
nodeid: backend.feature-index.part-8
parentnode: backend.feature-index
childnodes: []
codeanchors:
  - backend/modules/
---

Part 8 of 8 · [Feature Index — Dorak Backend](feature-index.md) · [Previous](feature-index-part-7.md)

## Feature Registry

All backend features are built, tested, and passing; the sections above are the live contract. Pending work lives in [execution status](14-execution-status.md).

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
