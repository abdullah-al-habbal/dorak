---
nodeid: docs.next_steps.coverage
parentnode: docs.next_steps
childnodes: []
codeanchors:
  - frontend/web/dashboard/src/config/nav.constant.ts
  - frontend/web/dashboard/src/config/proxy-allow-list.constant.ts
  - backend/modules/Dashboard/Routes/Api/V1/dashboard.php
---

# Coverage Matrix

Routes: [index](index.md).

## What each guard can do today (2026-11-09)

| Guard | Address | Screens |
|---|---|---|
| Admin | `/dashboard/admin` | Overview; Analytics; Bookings (all, with status changes); Brands (approve only); Branches (CRUD); Catalog (category CRUD, items read-only); Payouts (generate, approve, mark paid, cancel); Plans (CRUD); Subscriptions (assign, change status); Settings |
| Manager | `/dashboard/manager` | Overview; Bookings (walk-in, status, reschedule, cancel); Chairs; Stylists (create, edit, activate); Services; Working hours (up to four shifts); Earnings; Reviews (read-only) |
| Owner | `/dashboard/owner` | Overview; Bookings across branches; Branches (CRUD, approved brands only); Stylists; Working hours; Earnings; Payouts (read-only); Subscription (read-only) |
| Barber | `/dashboard/barber` | Overview; Schedule (read-only); Earnings |

Missing for every guard: an account page (NS-02), password recovery (NS-01), a working notifications bell (NS-10), and a `global-error` and portal-level error page (NS-29).

## How each account type joins

| Type | Public sign-up | Approval | Task |
|---|---|---|---|
| Brand owner | None today → public web page | Admin (Brands queue, shipped) | NS-03, NS-06 |
| Barber | Stylist app (works) | Admin, on `admin_api` only today | NS-30 |
| Client | Mobile app (works) | None; email verification | none |
| Branch | Never public; created by the owner | Not a real gate today | D9, NS-06 |
| Admin | Never public | Invited | NS-04 |

Details and evidence: [registration and error audit](09-audit-registration-and-errors.md).

## Filament map: what replaces each resource

Panel resources, from `modules/*/Filament/Panels/<Panel>/`:

| Filament resource | Panels | Replaced by |
|---|---|---|
| AdminUser | Admin | NS-04 |
| Brand | Admin | Brands (shipped) + NS-06 |
| Client | Admin | NS-07 |
| Ban | Admin | NS-07, NS-08 |
| Barber | Admin | NS-30 (approving sign-ups), NS-08 (everything else) |
| ActivationLog | Admin | NS-08 |
| Review | Admin, Branch, Barber | NS-05 (admin), Reviews + NS-14 (branch), `stylist_app` (barber) |
| Branch | Admin | Branches (shipped) |
| Branch Profile | Branch | Working hours (shipped) + NS-02 |
| Booking | Admin, Branch, Barber | Bookings (shipped), Schedule (shipped), `stylist_app` |
| Chair | Admin, Branch | Chairs (shipped) + NS-09 (admin) + NS-15 |
| OfferedService | Admin, Branch, Barber | Services (shipped) + NS-09 (admin), `stylist_app` (barber) |
| BarberAffiliation | Admin, Branch, Barber | NS-09 (admin), NS-16 (branch), `stylist_app` (barber) |
| JobPosting | Admin, Branch | NS-09 (admin), NS-17 (branch) |
| Application | Admin, Branch, Barber | NS-09 (admin), NS-17 (branch), `stylist_app` (barber) |
| Barber Profile | Barber | NS-02 + `stylist_app` (D7) |
| Currency, ExchangeRate | Admin | NS-19 |
| Language | Admin | NS-20 |
| Preference | Admin | NS-02 (each user's own settings) |
| ServiceCatalogCategory | Admin | Catalog (shipped) |
| ServiceCatalogItem, ServiceCatalogItemTag | Admin | NS-21 |

## Tables with no admin screen yet, outside the Filament map

| Tables | Task |
|---|---|
| `commission_rules`, `commission_entries` | NS-22 |
| `payment_gateways` | NS-23 |
| `payouts` (detail) | NS-24 |
| `branch_hours_overrides` | NS-12 |
| `features`, `plan_features` (per-brand overrides) | NS-06 |
| `status_change_logs` | NS-06 |
| `notifications` | NS-10 |
| `activation_logs` (barber and branch approvals) | NS-30, NS-08, NS-06 |
| `password_reset_tokens_*` | NS-01 |
| `marketing_pages`, `sections`, `testimonials`, `onboarding_configurations` | NS-25 (and the website error pages in NS-29, D13) |
| `barber_service_overrides` | NS-18 |
| `barber_portfolio_photos`, `barber_schedules` | `stylist_app` (D7) |
| Client personal data (`client_face_*`, `client_preference_vectors`, `client_interaction_logs`, `client_saved_filters`, `client_service_histories*`, `client_favorites`, `client_discovery_preferences`) | Not shown to admins (D4) |
| Infrastructure (`cache*`, `jobs`, `failed_jobs`, `job_batches`, `sessions`, tokens, `device_tokens`, `entity_embeddings`, `recommendation_edges`, `notification_deliveries`) | No screen needed |
