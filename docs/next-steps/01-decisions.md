---
nodeid: docs.next_steps.decisions
parentnode: docs.next_steps
childnodes: []
codeanchors:
  - backend/modules/
  - frontend/web/dashboard/src/
---

# Decisions for the Launch Roadmap

Routes: [index](index.md) · [open decisions](../decisions-required.md).

Each decision blocks only the tasks listed under it. A recommendation is given where the code or the PRD points one way. Record the answer here, and in [open decisions](../decisions-required.md), before the blocked task starts.

## D1: Filament is retired

**Decided 2026-11-09 by the product owner.** The Next.js dashboard replaces all three Filament panels (`/admin`, `/branch`, `/barber`). Every record an admin managed in Filament gets a dashboard screen, as mapped in the [coverage matrix](08-coverage-matrix.md). Filament is removed once that mapping is complete ([NS-28](07-phase-6-7-growth-and-retirement.md#ns-28-retire-filament)).

## D2: How a new brand owner joins

Blocks [NS-03](02-phase-1-access.md#ns-03-owner-self-registration-and-first-brand).

A brand belongs to a client account ([ADR 0001](../adr/0001-brand-owner-as-client.md)). Today only a client token or an existing owner can create one, and no interface does it.

- **(a) Recommended: "Register your business" on the dashboard.** It creates the client account and a pending brand, with an optional first branch. Owners already work on the web, and the "waiting for approval" state already exists.
- (b) A "Create my brand" screen in `client_app`, after which the owner signs in to the web.
- (c) The admin creates the brand for an existing client account. This works, but it puts the platform team in the sales path.

## D3: How the admin sees branch-level records

Blocks [NS-09](03-phase-2-governance.md#ns-09-branch-level-oversight-for-the-admin).

- **(a) Recommended:** platform-wide lists with brand and branch filters, matching admin Bookings and Branches.
- (b) Pick a branch first, then reuse the manager screens as they are.

## D4: What an admin may see about a client

Blocks [NS-07](03-phase-2-governance.md#ns-07-clients-and-bans).

**Recommended:** the account, verification and ban status, a booking count and history, and reviews written. Leave out the face analysis, preference vectors, interaction logs and saved filters, which are personal data the admin doesn't need. Also decide whether an admin may delete or anonymise an account on request.

## D5: How notifications reach the dashboard

Blocks [NS-10](04-phase-3-daily-operations.md#ns-10-notifications-feed-in-the-dashboard).

- **(a) Recommended first step: polling.** Refetch the unread count every 60 s while the tab is visible. The app sets `refetchOnWindowFocus: false` globally, so this query opts in.
- (b) A realtime channel, as the mobile apps use (see `frontend/mobile/docs/realtime/`). Add it after (a) if managers need instant alerts.

## D6: Plan billing at launch

Blocks [NS-26](07-phase-6-7-growth-and-retirement.md#ns-26-plan-self-service-and-billing) only.

**Recommended:** manual billing for launch. The admin assigns plans, which already works, and payment is taken outside the system. Owners see their plan read-only, as today. Self-service upgrades come later.

## D7: Barber web scope after Filament

Blocks [NS-27](07-phase-6-7-growth-and-retirement.md#ns-27-barber-web-extras).

The Filament `/barber` panel had profile, services, portfolio, invitations, applications, bookings and reviews. The PRD gives barbers a light web panel.

**Recommended:** keep the web light (schedule and earnings, plus the account page from NS-02). Self-service stays in `stylist_app`, which already has `services`, `portfolio`, `affiliations`, `jobs` and `reviews` features.

## D8: Rejecting and suspending a brand

Blocks [NS-06](03-phase-2-governance.md#ns-06-brand-lifecycle).

Brands are pending or active today. To decide:

- Does a rejected owner see the reason and resubmit?
- What happens to a suspended brand's branches, future bookings, subscription and public listing?
- Does an owner get a notification?
