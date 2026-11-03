---
nodeid: docs.audit.part-3
parentnode: docs.audit
childnodes: []
codeanchors:
  - backend/modules/
  - frontend/dashboard/src/
  - frontend/mobile/apps/
---

# Audit Findings

Part 3 of 3 · [Overview](product-audit.md) · [Matrix](product-audit-part-2.md)

| ID | Sev. | Finding |
|---|---|---|
| G1 | Major | **Resolved.** Stylists upload and tag (before/after/reference) history media on visits assigned to them via `POST /barber/history/{history}/media` (403 for anyone else's visit); stylist_app offers it from completed appointment cards and the client history screen. |
| G2 | Major | **Resolved.** Brands have a `status` (`pending` → `active`). A brand created through the API or dashboard starts `pending`; a platform admin approves it (`POST /admin/brands/{brand}/approve`, `PATCH /dashboard/admin/brands/{brand}/approve`, the dashboard Brands page, or the Filament Approve action). A pending brand is hidden from the public list/detail, and its branches cannot sign in, use the branch API or appear in discovery. Brands that existed before the gate were backfilled `active`. |
| G3 | Major | **Resolved.** business_app and stylist_app now list reviews and let a manager or stylist dispute a published one (reason 10–1000 characters); admins resolve in the dashboard. |
| G4 | Major | **Resolved.** `GET /dashboard/earnings` (owner: all own brands; manager: own branch; stylist: own completed bookings; admins use analytics) returns per-currency gross, platform commission and net (stylist: gross and net pay when an active affiliation has a commission percent). Owner-only `GET /dashboard/subscription` (plan, price, interval, features, grace date) and read-only `GET /dashboard/payouts` (own brands, drafts hidden). Dashboard pages: earnings (owner, manager, stylist), plan and payouts (owner). Mobile screens remain with G10/G11. |
| G5 | Major | Phone OTP uses the log-only SMS driver, so it is not launch-ready. |
| G6 | Medium | **Resolved.** A brand owner (or platform admin) sets a brand-specific price and/or duration for a barber's service: `PUT /dashboard/barbers/{barber}/services/{service}/override` with `brand_id`, `price_amount_minor`, `duration_minutes` (null keeps the barber's default; at least one required), `DELETE` the same path with `?brand_id=` to restore the default, `GET /dashboard/barbers/{barber}/services?brand_id=` to list. Stored in `barber_service_overrides` (unique per service and brand), so the barber's own record and other brands are untouched. Authorized by `BarberServiceOverridePolicy`: 403 for branch managers, barbers, foreign owners, and barbers who do not work for the brand. Booking length, slots, booking payloads, commission accrual and earnings/revenue totals use the override; clients see it by passing `branch_id` to `GET /barbers/{barber}/services`. Dashboard: `/owner|admin/stylists/{id}/pricing`. Mobile apps unchanged (additive fields only). |
| G7 | Medium | **Resolved.** `EnsureBranchAccountAccess` returns 403 `ACCOUNT_NOT_ACTIVE` for any branch that is not enabled, on every `auth:branch_api` route except logout. `EnsureBarberAccountAccess` (active scope) also blocks a branch-managed barber while the managing branch is disabled. |
| G8 | Medium | **Resolved.** `POST /barber|branch/forgot-password`, `/reset-password` (6-digit emailed code, 422 for wrong/expired/unknown, tokens revoked on reset), `/logout` (current token) and `/refresh-token` (rotates the token, 403 when deactivated). business_app and stylist_app have a forgot-password flow; logout revokes the server token; the session renews its token on start. |
| G9 | Medium | **Resolved.** `POST /client/social/{provider}` only links or creates a client by email when the provider vouches for it (`email_verified` or Google `verified_email`; a missing flag counts as unverified); otherwise 403 `SOCIAL_EMAIL_NOT_VERIFIED`. Already-linked provider accounts still sign in. client_app has no social login screen yet, so no mobile change. |
| G10 | Medium | business_app has no screens for services, opening hours, staff list, dispute or notifications. |
| G11 | Medium | Stylists see only today's appointments and have no inbox, settings, earnings or service editing. |
| G12 | Low | Unused client code: barber reviews, history update, `/explore/branches`, `/explore/barbers`, categories; saved addresses are local only. |
| G13 | Low | Dashboard polish: all nav icons are `home`, `.name.en` shown in Arabic, nested fields dropped on detail pages. |
| G14 | Low | `business_app` and `stylist_app` AGENTS.md were stale (fixed with this audit). |
| G15 | Low | Duplicate endpoints; `PATCH /chairs/{id}` lists `auth:client` but the policy always denies it; Sanctum abilities are never checked. |
| G16 | Nit | About 20 localization keys are unused. |

G5, G7, G8 and G9 are launch-readiness or security work and need no product call. The rest need the decisions listed in [open decisions](../decisions-required.md).
