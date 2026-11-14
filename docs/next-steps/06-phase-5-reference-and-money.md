---
nodeid: docs.next_steps.phase_5
parentnode: docs.next_steps
childnodes: []
codeanchors:
  - backend/modules/Dashboard/
  - backend/modules/Currency/
  - backend/modules/Language/
  - backend/modules/ServiceCatalog/
  - frontend/web/dashboard/src/
---

# Phase 5: Reference Data and Money

Routes: [index](index.md).

The platform runs on seeded values until these exist. They come after phases 1 to 4 because seeded data keeps working, while a locked-out user does not.

## NS-19: Currencies and exchange rates

- **Guards:** admin.
- **Story:** the admin adds a currency, retires one, and keeps the exchange rates current for multi-currency display.
- **Backend: Partial.**
  - `GET /admin/exchange-rates` exists, and `GET /currencies` is read-only on the Operations routes.
  - Currency writes and rate writes are New (tables: `currencies`, `exchange_rates`).
  - A currency in use (brand base currency, prices, payouts) can be deactivated, not deleted.
- **Dashboard:** a "Currencies" screen with a rates tab.
- **Done when:**
  - Pest covers the in-use guard and rate validation.
  - E2E covers adding a rate.

### NS-19 as built

- **Backend:** new `currencies.is_active` column. Admin routes under `/admin`: `GET|POST /currencies`, `PUT /currencies/{id}`, `PATCH /currencies/{id}/active`, `POST /exchange-rates`, `DELETE /exchange-rates/{id}` (plus the existing `GET /exchange-rates`), authorized through `CurrencyPolicy`. The code is set once; the default currency can't be retired; both currencies of a rate must be active and different, and the rate is positive up to 6 decimals. `GET /currencies` (mobile and pickers) now lists active currencies only, with the same shape.
- **Dashboard:** an admin "Currencies" screen with a Currencies tab (add, edit, retire and restore behind a confirmation) and an Exchange rates tab (history, newest first, "Current" marks the rate the converter uses; add and remove). The service form's currency picker refreshes after a change.
- **Mobile:** no change; the list response shape is unchanged.
- **Tests:** `backend/tests/Feature/Dashboard/DashboardAdminReferenceDataTest.php` covers the currency list, create (code rules, forced non-default and active), edit (code and flags immutable), retire and restore, the default-currency 409 (`DashboardAdminBackOfficeTest`), rate creation (inactive, unknown and same-pair currencies, rate bounds, optional date) and removal. No route deletes a currency, so an in-use currency can only be retired. 401 and 403 are in the admin authorization matrix. Dashboard Vitest and E2E are still open (WP-2, WP-3).

## NS-20: Languages

- **Guards:** admin.
- **Story:** the admin manages which languages the platform offers.
- **Backend: New.** The `languages` table has no API. Per the [operational defaults](01-decisions.md#operational-defaults), the screen only switches existing languages on and off. A new language needs translations in code, so admins can't create one.
- **Dashboard:** a "Languages" section under Settings.
- **Done when:** Pest covers the rule that the default language can't be switched off.

### NS-20 as built

- **Backend:** new `languages.is_active` column; admin `GET /admin/languages` and `PATCH /admin/languages/{id}/active` through `LanguagePolicy`. The default language answers 409 when switched off. There is no create or delete.
- **Dashboard:** a "Languages" section on the Settings screen with a switch per language (the default one is locked on).
- **Mobile:** no change.
- **Tests:** the same `DashboardAdminReferenceDataTest.php` covers the list order (default first), the default-language 409 and the flag validation; the on/off switch is in `DashboardAdminActiveToggleTest`. Dashboard tests are open.
- **Not done:** no other code reads `is_active` yet, so switching a language off does not yet hide it anywhere.

## NS-21: Catalog items, tags and media

- **Guards:** admin.
- **Story:** the admin curates the global service catalog below the categories: items, tags and images.
- **Backend: Partial.**
  - Item CRUD is ready (`/admin/catalog-items`).
  - Tags are read-only (`GET /admin/catalog-tags`), so tag writes are New.
  - Check `service_catalog_media` in the task.
- **Dashboard:** turn the read-only items preview in Catalog into full CRUD, and add tag management.
- **Done when:** E2E covers the item CRUD and tag assignment.

### NS-21 as built

- **Backend:** tag writes are new (`POST|PUT|DELETE /admin/catalog-tags`, `ServiceCatalogItemTagPolicy`, soft delete, generated slug); the tag list returns `slug`, `is_active` and `items_count`. Item CRUD was ready and is unchanged.
- **Dashboard:** the Catalog screen has Categories, Items and Tags tabs. Items: filter by category and search, add or edit (names, slug, category, description, default duration, active, tags) and delete behind a confirmation. Tags: add, edit (names, group, active) and delete. The proxy allows item and tag writes for the admin only.
- **Mobile:** no change.
- **Not done:** (1) catalog media (images): the dashboard has no file-upload path yet (multipart through the proxy), so images are not managed here; the list and the `media` field of an item stay read-only; (2) price range, face shape, hair texture and the other style attributes are kept as they are on edit but cannot be set from the form; (3) tests (skipped by instruction; the tag routes were smoke-checked with a throwaway Pest test that was not kept). One existing Vitest assertion (items were read only) was updated to the new rule.

## NS-22: Commission rules and ledger

- **Guards:** admin.
- **Story:** the admin sets the platform commission per plan, brand or service, and audits the commission charged on each booking.
- **Backend: Ready.** `/admin/commission-rules` CRUD and `GET /admin/commission-entries`.
- **Dashboard:**
  - a "Commissions" screen with Rules and Ledger tabs;
  - amounts per currency, never summed across currencies.
- **Done when:** E2E covers creating a rule and the ledger filters.

### NS-22 as built

- **Backend:** no change. `/admin/commission-rules` (CRUD) and `GET /admin/commission-entries` (filters `brand_id` and `settled`) were already served and authorized by `CommissionPolicy`.
- **Dashboard:** an admin "Commissions" screen with a Rules tab (add, edit and delete a rule for everyone, one brand or one branch; a percent is typed as a percent and sent as basis points, a flat amount needs a currency) and a Ledger tab (filter by brand and by paid out or not; each amount in its own currency, with totals per currency for the visible page only, never summed across currencies).
- **Mobile:** no change.
- **Not done:** tests (skipped by instruction); the ledger's per-entry rule snapshot is not shown.

## NS-23: Payment gateways

- **Guards:** admin.
- **Story:** the admin configures and activates the payment gateways.
- **Backend: Ready.** `/admin/payment-gateways` CRUD and `PATCH .../active`.
- **Dashboard:**
  - a "Payment gateways" section under Settings;
  - secrets are write-only, never shown back;
  - the security review is required.
- **Done when:** E2E covers creating and toggling a gateway, and a check confirms no secret appears in any response.

### NS-23 as built

- **Backend:** no change. `/admin/payment-gateways` CRUD and `PATCH .../active` already existed. The model hides `gateway_settings` and the resource returns only the names of the keys that are set. The default gateway and the last active one can't be switched off or deleted (409).
- **Dashboard:** a "Payment gateways" section on the Settings screen: a switch per gateway, a Default badge, "Credentials set: key names", and an add/edit dialog (code, both names, integration, order, active, default). Credentials are write-only: typed into password fields, sent once, never shown; leaving them empty keeps the stored ones and adding any replaces all of them. The proxy allows these routes for the admin only.
- **Security review:** the responses of list, create, update and activate were checked with a throwaway Pest test (a secret value never appears; the key names do); the admin guard is enforced by the proxy and by `DashboardAdminAuthorizationMiddleware` plus `PaymentGatewayPolicy`. The test was not kept.
- **Mobile:** no change.
- **Not done:** tests (skipped by instruction). Only the `offline` integration exists today, so the dialog offers that driver.

## NS-24: Payout detail

- **Guards:** admin; the owner's read-only view.
- **Story:** the admin opens a payout and sees its lines, period and status history before approving it or marking it paid.
- **Backend: Ready.** `GET /admin/payouts/{payout}`.
- **Dashboard:** a payout detail page linked from the existing list. The existing approve, mark-paid and cancel actions move onto it.
- **Done when:** E2E covers opening a payout and approving it from the detail page.

### NS-24 as built

- **Backend:** `GET /admin/payouts/{payout}` returns the approver (`approved_by`) and `updated_at`; new `GET /admin/payouts/{payout}/entries` returns the payout's lines (the commission entries it settles), paginated, through `PayoutPolicy::view`. Payouts have no status log, so the history is derived from the timestamps.
- **Dashboard:** clicking a row on the admin Payouts screen opens a detail dialog (an overlay, as brand and category details are, not a separate page): amount, status, period, the history (draft created, approved by whom, marked paid with the reference, cancelled), the paginated commission lines, and the approve, mark-paid and cancel actions. The list keeps its row actions too, so the existing flows and their E2E specs are unchanged. The proxy allows both reads for the admin only.
- **Mobile:** no change.
- **Not done:** the owner's read-only view of a payout's lines (no owner endpoint exists and the owner payouts list is unchanged); dashboard tests. Backend tests: `DashboardAdminOperationsTest` covers the detail and the entries route (including 404), and `DashboardAdminRouteAuthorizationTest` covers 401 and 403.
