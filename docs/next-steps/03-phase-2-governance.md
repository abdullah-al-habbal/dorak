---
nodeid: docs.next_steps.phase_2
parentnode: docs.next_steps
childnodes: []
codeanchors:
  - backend/modules/Dashboard/
  - backend/modules/Brand/
  - backend/modules/Client/
  - backend/modules/Ban/
  - backend/modules/Barber/
  - backend/modules/Activation/
  - backend/modules/Audit/
  - backend/modules/Review/
  - frontend/web/dashboard/src/
---

# Phase 2: The Platform Team Runs the Platform Alone

Routes: [index](index.md) · [decisions](01-decisions.md).

Once Filament is gone, these tasks are the only way to moderate, govern brands and act on accounts.

## NS-05: Review moderation

- **Guards:** admin.
- **Story:** when a branch or a stylist disputes a review, the admin reads it and the dispute, and resolves it.
- **Backend: Ready.** `GET /admin/reviews` and `PATCH /admin/reviews/{review}/resolve`. Confirm the list filters and the resolve outcomes in the task.
- **Dashboard:**
  - allow-list rules;
  - a "Reviews" admin screen with the disputed queue by default and a resolve dialog with a confirmation.
- **Done when:** Vitest covers the proxy rules, and E2E covers resolving a seeded dispute.

### NS-05 as built

- **Backend:** the routes were ready. `AdminReviewResource` gains `subject_name` (the branch, stylist or client being reviewed) and the list eager-loads the subject. Outcomes are `published` and `hidden`; resolving a review that is no longer `disputed` answers 422, and disputes nobody decides within 48 hours are re-published by `reviews:release-expired-disputes`.
- **Dashboard:** the admin "Reviews" entry opens the disputed queue (status filter in the URL). A row opens a resolve dialog with the review, the dispute reason, an outcome (keep published or hide) and an optional note. Proxy rules: `GET admin/reviews`, `PATCH admin/reviews/{id}/resolve`, admin only.
- **Tests:** `ReviewDisputeTest` and `DashboardAdminModerationTest` cover the core flow; `backend/tests/Feature/Dashboard/DashboardReviewDisputeTest.php` adds the queue (subject name, ordering, paging, `per_page` bounds), keep-published outcome with resolver and timestamp, the 422 on a second resolution, 404 on an unknown review, status and note validation, and the anonymous 401. Vitest and Playwright stay open (WP-2, WP-3).

## NS-06: Brand lifecycle

- **Guards:** admin.
- **Story:** the admin corrects a brand's details, rejects or suspends it with a reason, overrides its plan features, and sees its approval history.
- **Decisions:** [D8](01-decisions.md#d8-rejecting-and-suspending-a-brand-and-rejecting-a-barber) and [D9](01-decisions.md#d9-branch-approval-model), both resolved.
- **Backend: Partial.**
  - Editing is ready: `PUT /brands/{brand}`, with the admin already allowed.
  - Feature overrides (`GET|PATCH /admin/brands/{brand}/features`) and history (`GET /admin/audit/{subjectType}/{subjectId}`) exist only on `admin_api`. Add dashboard routes for them.
  - Reject and suspend are New:
    - `rejected` and `suspended` statuses, each with a required reason;
    - resubmission returns a rejected brand to `pending`, up to **3** times, then "contact support". NS-03's status page shows the reason and "Fix and resubmit".
    - **Suspended:** the brand's branches leave client search and take no new bookings. Existing future bookings stay, unless the admin ticks "also cancel future bookings", which cancels them and notifies each client. The subscription is unchanged. The owner and managers sign in to a "suspended" banner and can't create anything.
    - Reactivating restores the brand to `active`.
  - **Lock every transition, approval included.** `ApproveBrandAction` updates the status today with no lock, so a concurrent approve and reject could both apply ([audit §3](09-audit-registration-and-errors.md#3-registration-edge-cases)).
  - **Emails** for approved, rejected, suspended and reactivated, in the owner's language. Today approval sends nothing ([audit §2](09-audit-registration-and-errors.md#2-messages-and-rate-limits-today)).
  - The pickers already skip pending brands ([decisions](../decisions-required.md), Admin Brands). Extend the same rule to rejected and suspended brands, and enforce it in the backend as well.
  - **Branch status (D9):** remove `status` from `Dashboard/Http/Requests/Business/BranchRequest.php`. Add an explicit switch-on/switch-off action for the owner, which requires an approved brand and a branch within the plan limit. Branches of approved brands no longer start as a misleading `pending`. The admin can suspend or reactivate a branch; the activation exists on `admin_api` only today, so add a dashboard route.
- **Dashboard:** the existing brand detail dialog becomes a detail page with Edit, Reject, Suspend or Reactivate, Features and History. Branches get a Suspend or Reactivate action for the admin.
- **Done when:**
  - Pest covers each transition, the lock, the emails, the resubmission cap, the suspension effects on search and new bookings, the optional cancellation, and the branch switch rules.
  - E2E covers reject → resubmit → approve, and suspend.

## NS-07: Clients and bans

- **Guards:** admin.
- **Story:** the admin finds a client, sees their account and bookings, and bans or unbans them with a reason and an optional end date.
- **Decision:** [D4](01-decisions.md#d4-what-an-admin-may-see-about-a-client), resolved. Admins see the account, bans, bookings and reviews only. Client personal data such as face analysis, preference vectors and interaction logs is never exposed, and a test asserts it.
- **Backend: New.**
  - Add admin dashboard routes for listing, searching and showing clients.
  - Bans: the `bans` table is polymorphic, with `bannable`, `reason`, `expires_at` and `banned_by_id`. Add create and lift routes.
  - Confirm that `EnsureClientAccountAccess` honours a ban on every client route, and that a banned owner loses dashboard access.
- **Dashboard:** a "Clients" screen with search, a detail page and a ban dialog.
- **Done when:**
  - Pest covers ban enforcement and expiry.
  - E2E covers ban, then sign-in refused, then unban.

## NS-08: Barbers platform-wide

- **Guards:** admin.
- **Story:** the admin finds any barber across brands, sees their affiliations, activates or deactivates them, bans them, and reads the activation log. Approving new sign-ups is the earlier [NS-30](02-phase-1-access.md#ns-30-barber-approval-queue), because it locks barbers out. This task reuses NS-30's dashboard routes.
- **Backend: Partial.**
  - Activation exists only on `admin_api`: `POST /barbers/{barber}/activate|deactivate`, also for branches.
  - Activation logs are stored in `activation_logs`.
  - The platform-wide list and the dashboard routes are New. Bans reuse NS-07.
- **Dashboard:** a "Barbers" admin screen. It is separate from the branch "Stylists" screen, which manages one branch's staff.
- **Done when:** Pest and E2E cover activation, the log and a ban.

## NS-09: Branch-level oversight for the admin

- **Guards:** admin.
- **Story:** the admin inspects any branch's chairs, stylists, services, reviews, working hours, invitations and job postings, to support owners and to moderate.
- **Decision:** [D3](01-decisions.md#d3-how-the-admin-sees-branch-level-records), resolved: platform-wide lists with brand and branch filters.
- **Backend: Partial.**
  - The Operations routes already allow the admin: chairs, stylists, services, reviews, opening hours, affiliations and job postings.
  - Check in the task that each list works for an admin without a branch scope, and add `brand_id` and `branch_id` filters where they are missing.
- **Dashboard:**
  - admin menu entries;
  - the existing screens reused with a brand and branch filter;
  - read-only where the PRD keeps an action with the branch.
- **Done when:** Pest covers admin scoping on each list, and E2E covers the filter on two of the screens.

### NS-06 as built

- **Brand states:** `pending`, `active`, `rejected`, `suspended`. `BrandReviewService` (row-locked) approves, rejects (reason 3 to 500 characters), resubmits (owner; cap of 3 submissions, then 409 `brand_resubmission_limit`), suspends (optionally cancelling future bookings) and reactivates; every move is written to `status_change_logs` and the owner is emailed. A suspended brand is blocked by `BrandApprovalGuard` (403 `brand_suspended`) and its branches leave search, slots and booking because discoverability requires an active brand.
- **Branches (D9):** `status` is no longer accepted in the branch form. A new branch starts `disabled` under an approved brand, else `pending`. The owner (and the admin) switch a branch on or off; branch managers are refused (403, and the dashboard proxy no longer forwards the call), per the 2026-11-11 amendment to D9 (`PATCH /branches/{id}/switch-on|switch-off`); only the admin suspends and reactivates (`PATCH /admin/branches/{id}/suspend|reactivate`, reactivation returns the branch to `disabled`).
- **Admin extras:** feature overrides (`GET|PATCH /admin/brands/{id}/features`: `multi_branch`, `job_board`) and the status history (`GET /admin/audit/{brand|branch}/{id}`).
- **Dashboard:** brand detail dialog gains edit, reject, suspend (with the cancel-bookings switch), reactivate, feature switches and history; the branch list gains switch on/off and suspend/reactivate actions; the owner status page shows the rejection reason with "Fix details" and "Resubmit", or a suspended notice. Proxy rules added for all new routes (admin only unless noted).
- **Not done:** tests (deliberately skipped by instruction).

### NS-07 as built

- **Backend:** admin routes `GET /dashboard/admin/clients` (search by name, email or phone; filters `status` and `banned`), `GET /clients/{id}` (with ban history), `GET /clients/{id}/bookings`, `GET /clients/{id}/reviews`, `POST /clients/{id}/ban` (reason 3 to 500 characters, optional `expires_at`, empty means permanent) and `PATCH /clients/{id}/unban`. All are gated by `manage-clients` (admins only). `ClientBanService` bans and unbans under a row lock; a second ban answers 409 `account_already_banned` and unbanning an account with no active ban answers 409 `account_not_banned`. A lifted ban keeps its row (`lifted_at`, `lifted_by_id`) so the history stays. `BanObserver` already deletes a banned client's tokens, and `EnsureNotBanned` sits in the `api` group, so a banned client or owner is refused on every route including the dashboard.
- **D4:** `AdminClientResource` returns the account, ban status and history and the bookings count only. Face, preference, interaction, favourite and service-history data never appear in any admin payload.
- **Dashboard:** admin "Clients" screen (filters in the URL), detail dialog (account, ban history, latest bookings, reviews written), ban dialog (reason and optional end date) and an unban confirmation. Proxy rules are admin only.
- **Not done:** tests (skipped by instruction); paging inside the detail dialog (the latest 20 bookings and reviews only).

### NS-08 as built

- **Backend:** admin routes under `/dashboard/admin/barbers/{barber}`: `PATCH activate|deactivate` (optional reason), `POST ban` and `PATCH unban`, `GET activation-log` and `GET affiliations`, all behind the `review-barbers` gate. `BarberActivationService` moves only an approved barber to disabled and back (anything else answers 409 `barber_not_enabled` or `barber_not_disabled`; pending and rejected barbers stay in the NS-30 queue) and writes an `activation_logs` row with the admin and reason. The NS-07 ban service became `AccountBanService` and now serves clients and barbers; bans keep their history and the `BanObserver` signs the barber out of the stylist app. The list now returns every barber (branch-created ones included), and only the `pending` queue is limited to barbers with a login.
- **Dashboard:** the NS-30 screen is now the admin "Barbers" screen. Its detail dialog adds the ban history, the activation log and the affiliations, plus activate, deactivate, ban and unban. Banned barbers show a ban badge in the list.
- **Not done:** tests (skipped by instruction); a reason prompt on deactivation (the move is confirmed but the reason stays empty); the dashboard has no way to end a barber's affiliation.

### NS-09 as built

- **Backend:** the Operations routes already served the admin without a branch scope. Added filters, always AND-ed with the actor's scope so a filter can narrow a list but never widen it: `branch_id` on `GET /stylists`, `brand_id` on `GET /services` and `brand_id` on `GET /chairs` (chairs already had `branch_id`). Reviews, opening hours, affiliations and job postings are read through the existing per-branch routes.
- **Dashboard:** the admin menu gains Chairs, Stylists and Services, reusing the manager screens read-only for the admin (no "New", no row editing, switches disabled), with a branch filter on stylists (chip included) and chairs, and a brand filter on services. On the admin Branches screen a row opens a read-only oversight dialog with the branch's reviews, opening hours, barber invitations and job postings, plus an "Edit branch" shortcut. The proxy allows the admin to `GET branches/{id}/affiliations` and `job-postings`; NS-16 and NS-17 add the branch teams' rules.
- **Not done:** tests (skipped by instruction); paging inside the oversight dialog (the first page of each list only).
