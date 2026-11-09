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

**Decided 2026-11-09 by the product owner: (a), a public "Register your business" page on the dashboard.** It creates the client account and a pending brand, with an optional first branch. It also offers an existing app client a "sign in and create my brand" path. Only verified submissions reach the admin queue. The applicant follows the review on a status page and by email. The full flow and edge cases are in NS-03.

A brand belongs to a client account ([ADR 0001](../adr/0001-brand-owner-as-client.md)). The options not taken were (b) a "Create my brand" screen in `client_app`, and (c) the admin creating the brand for an existing client.

**Which account types get a public sign-up:**

| Type | Public sign-up | Approval |
|---|---|---|
| Brand owners | The new web page (NS-03) | Admin |
| Barbers | Keep the stylist app's existing sign-up | Admin, through the new queue (NS-30) |
| Clients | Mobile app only | None; email verification is enough |
| Branches | Never public; created inside an approved brand | See D9 |
| Admins | Never public | Invited (NS-04) |

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

- Does a rejected owner see the reason and resubmit? Recommended: yes, with a resubmission cap (a constant) and every decision kept in the status history.
- What happens to a suspended brand's branches, future bookings, subscription and public listing?
- Does an owner get a notification? Recommended: an email and an in-app notification for approved, rejected, suspended and reactivated.
- Does a barber rejection (NS-30) need a `rejected` status, or does `disabled` with a reason cover it? Keep the barber and brand answers consistent.

## D9: Branch approval model

Blocks the branch part of [NS-06](03-phase-2-governance.md#ns-06-brand-lifecycle).

Branches default to `pending`, but the owner can send any `status` when creating or editing a branch, so the default is not a real gate ([audit §1](09-audit-registration-and-errors.md#1-how-each-account-type-joins-today)).

- **(a) Recommended:** the brand approval and the plan's branch limit are the gate. A branch of an approved brand goes live when its owner enables it. The admin can suspend a branch. Remove the misleading `pending` default for new branches of approved brands.
- (b) Every new branch needs admin approval: enforce `pending`, take `status` away from the owner, and add a branch queue.

## D10: Re-registration after account deletion

Blocks one NS-03 edge case.

Clients are soft-deleted, and both the unique rule and the database index count deleted rows, so a deleted person can never register with that email again.

- **(a) Recommended:** offer to restore the account through email verification.
- (b) Anonymise the email when an account is deleted, which frees it.

## D11: Early access for a pending owner

Blocks the waiting part of NS-03.

**Recommended:** while pending, the owner may edit the brand profile and prepare a first branch, its services and chairs. Clients see nothing and no bookings are possible until approval. Decide whether stylists may be added before approval (recommended: no).

## D12: CAPTCHA on public forms

Blocks the CAPTCHA part of NS-03.

**Recommended for launch:** limits per IP and per email, a honeypot field, and email verification before a submission reaches the queue. Add a CAPTCHA (for example Cloudflare Turnstile) only if abuse appears. It needs a new package, so ask before installing it.

## D13: The Laravel public website

Blocks NS-29 item 5 and NS-25.

The Website module serves `/`, `/features` and `/pricing` from Laravel, with no error pages.

- **(a)** Keep it in Laravel: add en and ar 404, 500 and 503 views (NS-29), and manage its content in NS-25.
- (b) Move the public site next to the dashboard's public pages, and drop the Blade pages.
