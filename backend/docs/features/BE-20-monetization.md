# BE-20 — Monetization and Platform Analytics

## Status: ✅ Approved (Task 65) — all three decisions answered by the product owner with a **zero-hardcoding** rule: everything below is data an admin manages from the dashboard, not constants or enums in code.

## Resolved decisions
1. **Payment provider and timing.** Pay-at-salon stays the default v1 flow, but it is a row in `payment_gateways` (`pay_at_salon`, driver `offline`), not a constant. Gateways carry `is_active`, `is_default` and an encrypted JSON `config`, so local wallets (e.g. Syriatel Cash, Cash Plus) or online PSPs can be added from the Admin Dashboard later. **Out of scope now:** booking creation is not wired to gateways (`BookingPaymentMethod`/`BookingPaymentStatus` and the mobile apps are unchanged).
2. **Subscription plans and feature flags.** `subscription_plans` + `plan_features` tables; admins create, edit, delete plans, set price and billing interval, and map flags to any plan. The flags themselves are the code-defined registry `BrandFeatures::keys()` (gating code calls those keys), exposed to the UI by `GET admin/plan-feature-keys`.
3. **Commission model and payouts.** A `commission_rules` engine (percent or flat; global default with brand and branch overrides) and `commission_entries` accrued when a booking completes. `payouts` track settlement and are generated and approved from the admin panel (or the `payouts:generate` command, drafts only).

## Questions that were put to the product owner (answers in *Resolved decisions* above)

### 1. Payment provider and timing — resolved above
- Is there a payment provider at all for v1, or does the platform stay cash/pay-at-salon only
  (the only path that exists today — `BookingPaymentMethod::PayAtSalon`,
  `BookingPaymentStatus::UnpaidInPerson`)?
- If a provider is added: which one (Stripe, PayTabs, HyperPay, Fawry, etc. — the answer
  depends on which markets the platform operates in, which this repo does not record)?
- Are client payments captured online at booking time, or only settled offline between the
  salon and the platform (commission/payout only, no client-facing payment flow)?

### 2. Subscription plans and feature-flag mapping — resolved above
- What plans exist (e.g. Free / Pro / Enterprise), and what do they cost?
- How does each plan map to the brand feature flags already shipped in Task 50
  (`multi_branch`, `job_board` — see `backend/modules/Brand/...` flag definitions)? Is the
  mapping static (plan → fixed flag set) or does Pennant allow per-brand overrides on top of
  a plan's defaults?
- Billing cadence (monthly/yearly) and what happens to a brand's flags on non-payment/
  downgrade (grace period vs. immediate revocation)?

### 3. Commission model and payout schedule — resolved above
- Percent of booking value, a fixed fee per booking, or a fixed fee per billing period
  regardless of volume?
- Does the commission rate vary by brand, by plan tier, or is it platform-wide?
- Payout schedule to barbershops (weekly/monthly) and who initiates it (automatic job vs.
  an admin action)?

## What ships without waiting for approval (Task 65's non-blocked AC)

`OverviewAction::revenue` no longer hard-codes `0.0`. There is still no payments/transactions
table, so "revenue" is computed directly from the price of every service attached to a
completed booking, scoped the same way the rest of the overview endpoint is scoped
(`DashboardActor::scopedBranchIds()` — an admin sees every branch, a manager/owner only
their own). This is a real, if provisional, number derived from data that already exists,
and keeps the AC's test (`DashboardOverviewRevenueTest`) independent of the Phase A/B
decisions above. Once Phase B ships a transactions table, this method is the one call site
to repoint at it (`Modules\Dashboard\Http\Actions\OverviewAction::completedBookingsRevenue`).

## Entities, state machines and money representation

Every money column is an integer in **minor units** (2 fraction digits, `Commission\Support\MinorUnits`) next to a `currency_id`. Percent rates are **basis points** (100 = 1%). Statuses are Backed Enums.

| Table | Key columns |
| --- | --- |
| `subscription_plans` | translatable `name`/`description`, `price_minor`, `currency_id`, `interval_unit` (`day\|week\|month\|year`) + `interval_count`, `is_active`, `sort_order`, soft deletes |
| `plan_features` | `plan_id`, `feature_key` (unique pair; must be in `BrandFeatures::keys()`) |
| `brand_subscriptions` | `brand_id`, `plan_id`, `status`, `starts_at`, `ends_at`, `canceled_at` |
| `payment_gateways` | unique `code`, translatable `name`, `driver`, `is_active`, `is_default`, encrypted `config`, `sort_order` |
| `commission_rules` | `scope` (`global\|brand\|branch`), `scope_id`, `type` (`percent\|flat`), `value`, `currency_id` (flat only), `is_active` |
| `commission_entries` | unique `booking_id`, `brand_id`, `branch_id`, `rule_snapshot`, `base_minor`, `commission_minor`, `currency_id`, `payout_id` |
| `payouts` | `brand_id`, `currency_id`, `direction`, `status`, `total_minor`, period, `approved_by/at`, `paid_at`, `reference`, `notes` |

**State machines** (`canTransitionTo` on the enum; illegal moves answer 409):
- Subscription: `pending → active | canceled`; `active → past_due | canceled`; `past_due → active | canceled`; `canceled` is final. `past_due` is the grace period (features stay on); `canceled` revokes every flag.
- Payout: `draft → approved | canceled`; `approved → paid | canceled`; `paid` and `canceled` are final. Canceling releases the entries for the next run.

**Rules.**
- Assigning a plan cancels the brand's live subscription and sets every registry flag on or off to match the plan (`PlanFeatureSyncer`). Flags are only touched on a subscription change, so manual overrides survive in between.
- A plan with live subscriptions cannot be deleted (409). The default gateway and the last active gateway cannot be deleted or deactivated (409). Gateway config values are never returned, only their keys.
- Commission resolution: branch beats brand beats global, newest wins a tie, inactive rules are skipped, and a flat rule only applies in its own currency. A booking's base is the sum of its services' prices in the first service's currency. No applicable rule, no branch (freelance), or no services means no entry. Entries are idempotent per booking.
- `payouts.direction` is `brand_to_platform` (pay-at-salon: the brand owes the platform its commission); `platform_to_brand` is reserved for online gateways.

## API (all under the dashboard `admin` group, platform admins only, authorized by Policies)
`subscription-plans` (CRUD), `plan-feature-keys`, `subscriptions` (list, assign, `PATCH {id}/status`), `payment-gateways` (CRUD + `PATCH {id}/active`), `commission-rules` (CRUD), `commission-entries`, `payouts` (list, show, `POST generate`, `PATCH {id}/approve|mark-paid|cancel`), `analytics/overview`. Tests: `backend/tests/Feature/Monetization/`.

## Phase B build checklist

- [x] Migrations for `subscriptions`, `commission_rules`, `payouts`, and (if a provider is
      chosen) `transactions` — module-owned, per `database-conventions`.
- [x] CQRS modules behind `auth:admin_api`, with Policy classes (not ownership-scoped
      queries) per `backend/CLAUDE.md`.
- [x] Feature tests asserting 401/403 for every non-admin guard on every new route.
- [x] Dashboard admin pages for plans, commission rules, payouts, and a platform analytics
      overview, behind new allowlisted BFF paths (Task 65's Dashboard scope).
