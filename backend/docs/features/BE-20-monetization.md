# BE-20 — Monetization and Platform Analytics

## Status: ⏳ Spec draft — [NEEDSHIL] pending product-owner approval. **No Phase B code (migrations, modules, routes) may be written against this document until every decision below is answered and the document is marked `## Status: ✅ Approved` by the product owner.**

## Why this document is a draft, not a build

Task 65 (`docs/tasks/task-65-monetization-analytics-apis.md`) is explicitly spec-first: "no
code may be written until the spec is approved." Unlike every other backend gap in the
roadmap, subscriptions, commissions, payouts and platform analytics have **no detailed
product spec anywhere in the repo** — only one-line mentions in
`docs/mvp-gap-analysis-and-monorepo-roadmap.md`. The three decisions this feature needs (a
payment provider, a subscription→feature-flag mapping, and a commission/payout model) are
genuine business decisions — pricing, which PSP to contract with, what a barbershop pays the
platform — not engineering judgment calls inferable from existing code, docs, or precedent.
Nothing in the codebase answers them, so this document records them as open questions for a
human product owner rather than guessing. A repo-wide grep for `subscription|payout|commission`
under `backend/modules` finds nothing today; `OverviewAction::revenue` was hard-coded to `0.0`
until this task (now computed from completed-booking service prices — see below).

## Decisions required (product owner)

### 1. Payment provider and timing — **[NEEDSHIL]**
- Is there a payment provider at all for v1, or does the platform stay cash/pay-at-salon only
  (the only path that exists today — `BookingPaymentMethod::PayAtSalon`,
  `BookingPaymentStatus::UnpaidInPerson`)?
- If a provider is added: which one (Stripe, PayTabs, HyperPay, Fawry, etc. — the answer
  depends on which markets the platform operates in, which this repo does not record)?
- Are client payments captured online at booking time, or only settled offline between the
  salon and the platform (commission/payout only, no client-facing payment flow)?

### 2. Subscription plans and feature-flag mapping — **[NEEDSHIL]**
- What plans exist (e.g. Free / Pro / Enterprise), and what do they cost?
- How does each plan map to the brand feature flags already shipped in Task 50
  (`multi_branch`, `job_board` — see `backend/modules/Brand/...` flag definitions)? Is the
  mapping static (plan → fixed flag set) or does Pennant allow per-brand overrides on top of
  a plan's defaults?
- Billing cadence (monthly/yearly) and what happens to a brand's flags on non-payment/
  downgrade (grace period vs. immediate revocation)?

### 3. Commission model and payout schedule — **[NEEDSHIL]**
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

## Entities, state machines and money representation (to be completed on approval)

Left unspecified pending the decisions above — writing state machines for `subscriptions`,
`commission_rules`, `payouts` and `transactions` before the provider/plan/commission model is
chosen would mean re-deriving them from scratch anyway. Once decided, this section must fix,
at minimum: every money column as integer minor units (cents/fils) plus a `currency_id`
(matching the platform's existing `Modules\Currency` convention — `decimal:2` on
`offered_services.price` is a pre-existing gap, not a pattern to copy), and a Backed Enum for
every status column per `12StrictEnums`.

## Phase B build checklist (do not start before this document says `Approved`)

- [ ] Migrations for `subscriptions`, `commission_rules`, `payouts`, and (if a provider is
      chosen) `transactions` — module-owned, per `database-conventions`.
- [ ] CQRS modules behind `auth:admin_api`, with Policy classes (not ownership-scoped
      queries) per `backend/CLAUDE.md`.
- [ ] Feature tests asserting 401/403 for every non-admin guard on every new route.
- [ ] Dashboard admin pages for plans, commission rules, payouts, and a platform analytics
      overview, behind new allowlisted BFF paths (Task 65's Dashboard scope).
