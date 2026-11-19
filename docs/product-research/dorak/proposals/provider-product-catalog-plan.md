# Provider product catalog: implementation plan and tracker

Status: Approved for execution, one task at a time. Source proposal: [provider-product-catalog.md](provider-product-catalog.md). Created 2026-11-19. Do not mark the capability as present in the Dorak study or feature matrix until PC-10 is finished and the study is refreshed.

## Working rules

- Task ids are PC-0 to PC-10 (Product Catalog). They are named apart from the repository's own `Tn` and `Task n` numbers used in commit messages and the backlog.
- One task at a time. After each task: update its status here, report to the owner, and wait before starting the next.
- Repository rules apply: no relative imports, imports at the top of files, `declare(strict_types=1);`, focused regression tests, subsystem gates before a task is marked done.
- Local commits only, with the task number in the message. Never push. Stage only the files a task touched.
- Line references in this plan come from a read-only review. Items marked "unverified" must be re-checked in PC-1 before use.

## Decisions (PC-0, done)

1. The product definition is brand-owned; each branch has its own listing with price, currency, publication and stock.
2. `catalog_enabled` is a per-branch setting, not a brand-wide Pennant flag.
3. The pilot covers existing salons and barbershops only. Product-only shops are deferred.

## Task tracker

| ID | Task | Depends on | Status |
|---|---|---|---|
| PC-0 | Decisions recorded in the proposal | none | Done |
| PC-1 | Pre-implementation reading and verification (no code) | PC-0 | Done (one owner decision open, see PC-1 findings) |
| PC-2 | Backend schema and models | PC-1 | Done (see PC-2 contract) |
| PC-3 | Permissions and write actions, including stock edits | PC-2 | Not started |
| PC-4 | Product images | PC-3 | Not started |
| PC-5 | Public read endpoint | PC-3 | Not started |
| PC-6 | Backend acceptance test suite | PC-4, PC-5 | Not started |
| PC-7 | Dashboard Products screen | PC-6 | Not started |
| PC-8 | Client app Products section and booking-UI gating | PC-5 | Not started |
| PC-9 | Docs, backlog entry, gates and local commit | PC-7, PC-8 | Not started |
| PC-10 | Pilot | PC-9 | Not started |

PC-4 and PC-5 can run in either order, and PC-7 and PC-8 can run in either order, but still one at a time.

## Task details

### PC-1. Pre-implementation reading and verification (no code)

- Read `docs/13-technical-concepts.md` (optimistic locking, idempotency) and `AGENTS.md:36` (migration rule).
- Decide how `catalog_enabled` is added to `branches`: edit the original create-branches migration, or add a new migration.
- Re-verify the unverified line references listed at the end of this file.
- Output: a short findings note appended under PC-1 in this file.

Done when: the migration approach and the optimistic-lock approach are written down, and every unverified reference is confirmed or corrected.

### PC-2. Backend schema and models

- New module `ProductCatalog` (not `Catalog`, which clashes with the service catalog). Provider registered in `bootstrap/providers.php`; module folders follow `Chair` or `OfferedService`.
- Tables:
  - `products`: brand-owned; translatable name and description (en and ar); category; bounded public metadata; status.
  - `product_media`: modelled on the service-catalog media table.
  - `branch_products`: unique on product and branch; price in minor units; currency; published flag; nullable stock; stock confirmed-at; `version`.
  - `stock_adjustments`: ledger of every stock change.
- Per-branch opt-in in the new `branch_catalog_settings` table (BD-4 decided 2026-11-19).
- Database checks: stock is non-negative; price is non-negative. Null stock means unknown; zero means out of stock.

Done when: migrations run on MySQL 8.4, and model tests cover null versus zero stock and the unique constraint.

### PC-2 implemented contract (2026-11-19)

Module `backend/modules/ProductCatalog`, provider registered in `bootstrap/providers.php`, one `create_<table>_table` migration per table, `2026_11_19_000010` to `000050` (new tables only). No routes, policies, resources or actions yet.

| Table | Purpose | Key columns and rules |
|---|---|---|
| `branch_catalog_settings` | Per-branch opt-in | `branch_id` unique, `is_active` default false (the schema naming test bans `*_enabled` and requires an `is_` prefix on booleans). No row means disabled. Cascades with the branch. |
| `products` | Brand-owned definition | `brand_id`, translatable `name` and `description` (en, ar), `category` (free text, 60 characters, taxonomy still open under BD-5c), `metadata` JSON (key whitelist enforced in PC-3), `is_active`. |
| `product_media` | Images | `product_id`, `image_path`, `alt_text`, `sort_order`. Plain foreign key, not polymorphic. |
| `branch_products` | Listing at one branch | Unique (`product_id`, `branch_id`); `price_amount_minor` unsigned; `currency_code` foreign key to `currencies`; `is_published` default false; `stock_quantity` unsigned and nullable (null is unknown, 0 is out of stock); `stock_confirmed_at`; `version` default 1, not mass-assignable. |
| `stock_adjustments` | Append-only ledger | `branch_product_id`, `actor_type` (reuses `StatusChangeActorTypeEnum`), `actor_id`, `quantity_before` and `quantity_after` (nullable), `version_after`, `reason`, `created_at` only. |

Deletion: brand, branch and product deletes cascade to their products, listings, media and ledger rows.

**Invariant left to PC-3 (not expressible as a foreign key):** a listing's product and branch must belong to the same brand. The write action and policy must enforce it, and PC-6 must test it (a manager or owner of brand B cannot list brand A's product at a brand B branch, and the reverse). `BranchProductFactory::forBranch()` builds consistent fixtures.

Tests: `backend/tests/Feature/ProductCatalog/ProductCatalogSchemaTest.php` (13 tests). The full backend run caught the original `enabled` column name against `tests/Unit/Core/SchemaNamingConventionTest.php`; renamed before commit.

### PC-3. Permissions and write actions

- Policy and gates modelled on `DashboardChairPolicy`:
  - Product definition writes: owner and admin.
  - Listing, price, publish and stock writes: anyone who passes `canAccessBranch` for that branch.
- Dashboard routes in `dashboard-operations.php`. Each write action runs the policy, `ensureBranchManageable` and `DashboardWriteGuard`.
- Stock edit: requires `version`, runs in a transaction with `lockForUpdate`, writes a ledger row, and returns 409 on a stale version.
- Reject negative quantities and inactive currencies.

Done when: `DashboardWriteGuardArchitectureTest` and `DashboardCrossTenantRouteTest` pass with the new routes.

### PC-4. Product images

- Multipart upload and delete, with sort order. Limits copied from the service catalog: 2048 KB, jpeg, png, webp, 4096 px maximum side, no SVG, 10 per product.
- Authorization follows the product definition (owner and admin).

Done when: validation tests pass, and a user from another brand cannot upload against this product.

### PC-5. Public read endpoint

- `GET /branches/{branch}/products`, paginated, media eager-loaded.
- Visible only when the branch is discoverable, `catalog_enabled` is on, and the listing is published.
- Stock is returned as `in_stock`, `out_of_stock` or `unconfirmed`. The freshness window is a setting.
- No caching in the MVP.

Done when: drafts, disabled catalogs, and suspended or non-discoverable branches return nothing, and direct product links return 404.

### PC-6. Backend acceptance test suite

Pest feature tests under `tests/Feature/ProductCatalog/`, plus a concurrency test:

| Area | Test |
|---|---|
| Cross-branch | Owner of brand B cannot read or write brand A's products or listings; no tenant table changes. |
| Cross-branch | Manager of branch 1 cannot edit the listing at branch 2 of the same brand. |
| Cross-branch | Manager cannot edit the brand's product definition. |
| Cross-branch | Owner can edit any of their own branches. |
| Isolation | One product at branches A and B: changing price or stock at A leaves B unchanged. |
| Stock | Negative quantity returns 422. |
| Stock | Unknown (null) is distinct from zero in dashboard and public responses. |
| Stock | Outdated `version` returns 409 and changes nothing. |
| Stock | Two concurrent adjustments both apply or one is rejected, never lost (`tests/Concurrency`). |
| Stock | The adjustment and its ledger row commit together. |
| Stock | Stale confirmed-at is shown publicly as `unconfirmed`. |
| Visibility | Drafts and unpublished listings never appear publicly. |
| Visibility | Disabled catalog, non-discoverable branch, or suspended brand: tab and direct link return 404. |
| Visibility | Booking endpoints behave the same with the catalog on or off. |
| Suspension | Writes on a suspended branch fail through the write guard. |
| Validation | Image type, size and dimensions; metadata rejects HTML and undeclared keys. |
| Money | Integer minor units and an active currency are required. |

Done when: `composer test` passes serially on MySQL 8.4.

### PC-7. Dashboard Products screen

- Clone the services screen pattern: list, dialog form, publish toggle, stock field, images.
- Nav entries for owner and manager, proxy-allow-list rules (including the multipart upload rule), en and ar locale strings.
- Owner sees definitions and all branches. Manager sees only their own branch's listing, price and stock.

Done when: Vitest component tests pass, and a Playwright spec covers a manager editing their own branch's stock.

### PC-8. Client app Products section and booking-UI gating

- New DTO fields in `core`, regenerate generated code.
- Products section on the branch profile, shown only when the catalog is enabled and has published items.
- Gate the booking-mode, booking-submit and payment-method sections on the branch having services or chairs.

Done when: a widget test shows no date, time or confirm controls for a branch with no services or chairs, and existing booking tests still pass.

### PC-9. Docs, backlog entry, gates and local commit

- Backend docs, backlog index and `docs/index.md` updated. Add a separate backlog item for the public brand endpoint exposing the owner's email.
- Run backend, dashboard and mobile gates and the hygiene cleanup cycle.
- Local commit with the task number. No push.

Done when: all gates are green.

### PC-10. Pilot

Two to four existing businesses, at least one with several branches. Measure the share that publish and keep listings current, tab opens and detail views per eligible visitor, spot-checked price and stock accuracy, and any change in booking clicks. Expand only if operators keep listings current, customers use them, and booking is not crowded out. Do not claim attributed sales.

### PC-1 findings (2026-11-19)

**Migration approach for `catalog_enabled` (owner decision needed before PC-2).** Three sources disagree:
- `backend/AGENTS.md:58` says to edit the original `create_*_table` migration for an existing table, and to add a new migration file only for a brand-new table (pre-release rule).
- CI rejects edits to already-shipped migrations (`.github/workflows/backend-ci.yml:62-65`, guard at `backend/scripts/check_migrations.php`). Editing `0001_01_01_200011_create_branches_table.php` risks failing that check.
- There is precedent for an additive fragment: `backend/modules/Brand/Database/Migrations/2026_11_10_000003_add_review_columns_to_brands_table.php`, added in commit 5ccfc9560.

Options:
1. **New table `branch_catalog_settings`** (branch id unique, enabled flag, freshness override later). Complies with both the repo rule and the CI guard. Costs one join on the public read. **Recommended.**
2. Additive `add_catalog_enabled_to_branches_table` migration (non-null with default false). Simplest read path and has precedent, but breaks the written rule at `AGENTS.md:58`.
3. Edit the original branches migration. Follows the written rule, but likely fails the CI guard.

**Optimistic locking.** The concept is documented (`backend/docs/13-technical-concepts-part-2.md:25-60`: `version` column, `expected_version` in the request, reject on mismatch). It is not implemented anywhere: a search of `modules` and `tests` for `expectedVersion`, `expected_version` and `StaleDataException` found nothing. There is no `version` column in any migration. So PC-3 introduces the pattern. Use the documented shape, but do the check as a conditional update inside the transaction (`where version = expected`, zero rows updated means conflict) rather than read-compare-write. For the 409 response, extend `ConflictApiException` (`backend/modules/Core/Exceptions/ConflictApiException.php:9`, abstract). The idempotency-key concept (`part-3.md`) is also documented but unimplemented; it is not needed for stock edits because a version check already prevents double application.

**Verified or corrected references.**

| Reference | Result |
|---|---|
| Services proxy rules | Confirmed: `proxy-allow-list.constant.ts:144-146` (GET for operations guards; writes for admin and owner only). |
| Multipart upload flag | Confirmed: `upload: true` at `proxy-allow-list.constant.ts:36` (brand logo, owner) and `:136` (catalog-item media, admin only). |
| Services components and hooks | Confirmed: `frontend/web/dashboard/src/components/services/` (5 files) and `src/hooks/services/services/` (8 hooks). |
| Service request rules | Confirmed: `backend/modules/Dashboard/Http/Requests/Business/ServiceRequest.php:19` (`price_amount_minor` required, integer, min 0; `currency_code` uses `ActiveCurrencyRule`; `name` requires en and ar, max 120). |
| Booking widgets always render | Confirmed for the mode section (no guard around the section; branches only on state inside it, `booking_mode_section.widget.dart:47-50`) and the submit section (`booking_submit_section.widget.dart:49-79` branches on state only). The payment section has no conditional. They are not gated on services or chairs. |
| Branch go-live prerequisites | Confirmed: `BranchLifecycleService::switchOn` (`backend/modules/Branch/Services/BranchLifecycleService.php:31-45`) requires an approved brand, non-suspended status and `ensureBranchManageable`. No chair, barber or service requirement. |
| Public brand endpoint exposes owner email | Confirmed at `BrandResource.php:20-22`; wider impact not assessed. Goes to the PC-9 backlog item. |
| Audit enum | `StatusChangeSubjectTypeEnum` exists (`backend/modules/Audit/Enums/StatusChangeSubjectTypeEnum.php:16`); it is status-only, so stock changes use the new ledger. |

**Plan changes from PC-1:** PC-2 uses the migration option the owner picks. PC-3 builds the version check from scratch, with a conditional update and a 409 conflict exception.

## Blockers, risks and notes register

Everything found in the review that affects this plan. IDs refer to `docs/backlog/index.md`.

| Item | Type | Affects | Backlog |
|---|---|---|---|
| `catalog_enabled` storage approach (resolved: `branch_catalog_settings` table; dev migration rule and CI waiver recorded in the backlog under "Migrations") | Resolved | PC-2 | BD-4 (closed) |
| Product details to confirm: roles split, stock freshness, exact count, categories, currency, metadata keys, section or tab | Decision | PC-2 to PC-5, PC-7, PC-8 | BD-5 |
| Optimistic locking is documented but not implemented; PC-3 builds it | Risk | PC-3 | TD-8 |
| Client booking, submit and payment sections always render | Blocker for PC-8 | PC-8 | FT-19 |
| No venue type; shop would appear in barber discovery; onboarding assumes a salon | Blocker for product-only shops only | deferred | FT-19a |
| Brand page returns no products; no client brand screen | Scope limit | deferred | FT-19b |
| No branch image field; profile has no sections or tabs | Scope limit | PC-8 | FT-19c |
| Public brand endpoint exposes the owner's email | Separate bug | none (PC-9 mention) | BG-8 |
| Minor-unit factor is a global 100 | Risk | PC-2, PC-3 | BG-13 |
| "Catalog" already means the service catalog; use the module name `ProductCatalog` | Note | PC-2 | none |
| Every non-GET dashboard action must call `DashboardWriteGuard` or be exempted, or `DashboardWriteGuardArchitectureTest` fails | Note | PC-3 | none |
| New `{branch}` routes are exercised by `DashboardCrossTenantRouteTest` | Note | PC-3, PC-6 | none |
| Branch managers are tied to exactly one branch; owners to all their brands' branches; downgrade rule EC-6 limits manageable branches (`ensureBranchManageable`) | Note | PC-3 | none |
| Audit logger is status-only; stock changes need their own ledger | Note | PC-2, PC-3 | none |
| Public reads are not cached, so the proposal's cache-invalidation criterion is trivially met in the MVP | Note | PC-5 | none |
| There is no shared media module; copy the service-catalog media pattern; the multipart proxy rule is admin-only today and needs an owner rule | Note | PC-4, PC-7 | none |
| Branch model is also a login account; suspended or disabled branches keep their session but writes are blocked | Note | PC-3 | none |
| Study-level risks found earlier (booking idempotency, throttling, reminders, consent, operations, release config) are not caused by this feature but constrain a pilot | Context | PC-10 | BG-9 to BG-14, RR-4 to RR-6, BD-6 |

## Deferred, not in this plan

Brand-level browsing, bulk assignment, variants, product-only onboarding (needs a venue-type or bookings-enabled field), checkout, orders, payments.

## Unverified references to re-check in PC-1

- `AGENTS.md:36` migration rule (as summarized by the review). Corrected in PC-1: the rule is at `backend/AGENTS.md:58`.
- Proxy-allow-list multipart flag and the services rules near `proxy-allow-list.constant.ts:144-146`.
- Services form components and hooks under `frontend/web/dashboard/src/components/services/` and `src/hooks/services/`.
- `ServiceRequest.php:19` (currency rule and price validation).
- The booking submit and payment sections always rendering (`booking_submit_section.widget.dart`).
- `BranchLifecycleService` has no chair, barber or service prerequisite.
- Public brand endpoint exposing the owner's email (verified at `BrandResource.php:20-22`; wider impact not assessed).

## Change log

- 2026-11-19: plan created; PC-0 done.
- 2026-11-19: PC-2 done: schema, models, factories and tests; BD-4 resolved and moved to Decisions in force.
- 2026-11-19: PC-1 done; open owner decision on the `catalog_enabled` migration approach (backlog BD-4).
- 2026-11-19: full audit of findings codified: backlog gained BD-5, BD-6, BG-9 to BG-14, FT-19a to FT-19c, FT-20 to FT-22, TD-10 to TD-12, RR-4 to RR-6; blockers register added above.
- 2026-11-19: findings codified in `docs/backlog/index.md` (BD-4, BG-8, FT-19, TD-8, TD-9) and the PC-0 decisions added to "Decisions in force". Task ids renamed from T0-T10 to PC-0-PC-10.
