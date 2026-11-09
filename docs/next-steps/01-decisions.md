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

**All decisions D1 to D13 are resolved.** D1 and D2 were decided on 2026-11-09, and D3 to D13 were accepted as recommended on 2026-11-09 by the product owner. Each entry gives the choice, how it behaves, and what is deliberately not done. The tasks that depended on a decision now carry its answer in their scope. Values that need a backend constant are listed under [operational defaults](#operational-defaults).

## D1: Filament is retired

**Decision (D1, resolved 2026-11-09).** The Next.js dashboard replaces all three Filament panels (`/admin`, `/branch`, `/barber`). Every record an admin managed in Filament gets a dashboard screen, as mapped in the [coverage matrix](08-coverage-matrix.md). Filament is removed once that mapping is complete ([NS-28](07-phase-6-7-growth-and-retirement.md#ns-28-retire-filament)).

## D2: How a new brand owner joins

**Decision (D2, resolved 2026-11-09): a public "Register your business" page on the dashboard.**

- It creates the client account and a pending brand, with an optional first branch.
- It offers an existing app client a "sign in and create my brand" path, because a brand belongs to a client account ([ADR 0001](../adr/0001-brand-owner-as-client.md)).
- Only verified submissions reach the admin queue.
- The applicant follows the review on a status page and by email.
- The full flow is in [NS-03](02-phase-1-access.md#ns-03-owner-self-registration-and-first-brand).

Options not taken: a `client_app` screen, or the admin creating brands for clients.

| Type | Public sign-up | Approval |
|---|---|---|
| Brand owners | The new web page (NS-03) | Admin |
| Barbers | Keep the stylist app's existing sign-up | Admin, through the new queue (NS-30) |
| Clients | Mobile app only | None; email verification is enough |
| Branches | Never public; created inside an approved brand | See D9 |
| Admins | Never public | Invited (NS-04) |

## D3: How the admin sees branch-level records

**Decision (D3, resolved): one platform-wide list per screen, with brand and branch filters.**

- This matches admin Bookings and Branches, and the branch list already has `brand_id` and `status` filters.
- The admin can work across branches, for example "all disputed reviews this week".
- **Not done:** a "pick a branch first" mode.
- **Follow-up:** [NS-09](03-phase-2-governance.md#ns-09-branch-level-oversight-for-the-admin) adds the missing `brand_id` and `branch_id` filters.

## D4: What an admin may see about a client

**Decision (D4, resolved): account, bans, bookings and reviews only.**

- **Visible:** name, email, phone, verification status, ban status and history, bookings, and reviews the client wrote.
- **Never exposed to admins, by any route or screen:**
  - `client_face_*`;
  - `client_preference_vectors`;
  - `client_interaction_logs`;
  - `client_saved_filters`;
  - `client_service_histories*` and their media;
  - `client_favorites` and `client_discovery_preferences`.

  No admin task needs them.
- **Deletion on request:** follows D10.
- **Follow-up:** [NS-07](03-phase-2-governance.md#ns-07-clients-and-bans).

## D5: How notifications reach the dashboard

**Decision (D5, resolved): polling for launch.**

- The unread count refetches every 60 seconds while the tab is visible, and on sign-in. This query opts in, because the app sets `refetchOnWindowFocus: false` globally.
- No new infrastructure.
- **Not done:** a realtime channel. It's added later only if managers report the delay as a problem.
- **Follow-up:** [NS-10](04-phase-3-daily-operations.md#ns-10-notifications-feed-in-the-dashboard).

## D6: Plan billing at launch

**Decision (D6, resolved): manual billing.**

- The admin assigns plans (already shipped), and payment is taken outside the system. Owners see their plan read-only.
- **Not done:** checkout, invoices or webhooks. [NS-26](07-phase-6-7-growth-and-retirement.md#ns-26-plan-self-service-and-billing) is deferred until after launch.

## D7: Barber web scope after Filament

**Decision (D7, resolved): the barber web stays light.**

- It has schedule, earnings and the account page (NS-02).
- Services, portfolio, invitations, jobs and reviews stay in `stylist_app`, which already has them, as the PRD intends.
- [NS-27](07-phase-6-7-growth-and-retirement.md#ns-27-barber-web-extras) closes with no work.

## D8: Rejecting and suspending a brand, and rejecting a barber

**Decision (D8, resolved).**

- **Brand rejection:**
  - A new `rejected` status with a required reason.
  - The owner sees the reason on the status page, edits, and resubmits, which sets the brand back to `pending`.
  - After **3 resubmissions** the page shows "contact support" instead.
  - Every decision is recorded in `status_change_logs`.
- **Brand suspension:**
  - A new `suspended` status with a required reason.
  - The brand's branches leave client search and take **no new bookings**.
  - **Existing future bookings stay.** The suspend dialog offers an optional "also cancel future bookings", which cancels them and notifies each affected client.
  - The subscription is unchanged, because billing is manual (D6).
  - The owner and managers can still sign in. They see a "suspended" banner and can't create anything new.
  - **Reactivating** restores the brand to `active`.
- **Messages:** an email and an in-app notification for approved, rejected, suspended and reactivated, in the owner's language.
- **Barbers:**
  - The same model, with a new `rejected` status and a required reason.
  - The barber fixes the profile and resubmits within the same cap of 3.
  - `disabled` keeps its meaning, "switched off after approval".
  - The stylist app updates in the same task, so it shows the reason and handles the new status value.
- **Concurrency:** every transition, approval included, is row-locked.
- **Follow-up:** [NS-06](03-phase-2-governance.md#ns-06-brand-lifecycle) and [NS-30](02-phase-1-access.md#ns-30-barber-approval-queue).

## D9: Branch approval model

**Decision (D9, resolved): the brand approval and the plan's branch limit are the gate.**

- A branch of an approved brand goes live when its owner switches it on.
- The admin can suspend and reactivate a branch.
- The owner can no longer send `status` in the branch create and edit request. Switching a branch on or off becomes an explicit action that checks the brand is approved and within the plan limit.
- The misleading `pending` default no longer applies to branches of approved brands.
- **Not done:** a per-branch admin approval queue.
- **Follow-up:** NS-06.

## D10: Re-registration after account deletion

**Decision (D10, resolved): deleting an account anonymises it and frees the email.**

- The email, name and phone are replaced.
- Bookings stay for the brands' records, without personal details.
- Registering again with that email creates a fresh account.
- A banned email stays refused. Abuse is handled by bans, not by keeping deleted accounts.
- **Not done:** restoring deleted accounts.
- **Follow-up:** NS-03 locates every place where a client is deleted today and applies the anonymisation there.

## D11: Early access for a pending owner

**Decision (D11, resolved).**

- **Allowed while pending:** edit the brand profile, and prepare **one branch** (the first branch) with its working hours, chairs and services.
- **Not allowed until approval:**
  - adding stylists or sending invitations;
  - more branches;
  - anything clients can see;
  - bookings.
- On approval, the prepared branch can be switched on (D9).
- **Follow-up:** NS-03.

## D12: CAPTCHA on public forms

**Decision (D12, resolved): no CAPTCHA at launch.**

- Limits per IP **and** per email (see the defaults below).
- A hidden honeypot field.
- Email verification before a submission reaches the admin queue.
- **Not done:** Cloudflare Turnstile. It's added only if junk sign-ups appear, and the new package needs approval first.

## D13: The Laravel public website

**Decision (D13, resolved): keep it in Laravel.**

- The Website module (`/`, `/features`, `/pricing`, already localized through `SetLocaleMiddleware`) stays.
- It gains English and Arabic 404, 500 and 503 pages ([NS-29](02-phase-1-access.md#ns-29-error-handling-and-error-pages) item 5).
- Its content is managed by NS-25.
- **Not done:** moving it into the Next.js app. Revisit after launch.

## Operational defaults

Accepted with the decisions. Each value becomes a named constant in the owning module's `Constants` class, never a literal.

| Value | Default | Used by |
|---|---|---|
| Delete never-verified sign-ups after | 7 days | NS-03 (owners and app clients) |
| Resubmission cap | 3, for brands and barbers | NS-06, NS-30 |
| Notification refresh interval | 60 seconds, visible tab only | NS-10 |
| Registration limits | 5 per minute per IP (as today) and 5 per hour per email | NS-03, NS-30, NS-01 (reset requests) |
| Languages screen | Switch the existing languages on and off only; a new language needs translations in code | NS-20 |
