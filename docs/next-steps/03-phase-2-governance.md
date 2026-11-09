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

## NS-06: Brand lifecycle

- **Guards:** admin.
- **Story:** the admin corrects a brand's details, rejects or suspends it with a reason, overrides its plan features, and sees its approval history.
- **Needs:** [D8](01-decisions.md#d8-rejecting-and-suspending-a-brand) and [D9](01-decisions.md#d9-branch-approval-model).
- **Backend: Partial.**
  - Editing is ready: `PUT /brands/{brand}`, with the admin already allowed.
  - Feature overrides (`GET|PATCH /admin/brands/{brand}/features`) and history (`GET /admin/audit/{subjectType}/{subjectId}`) exist only on `admin_api`. Add dashboard routes for them.
  - Reject and suspend are New:
    - statuses with a required reason;
    - resubmission for a rejected owner within the D8 cap; NS-03's status page shows the reason and "Fix and resubmit";
    - side effects as D8 decides.
  - **Lock every transition, approval included.** `ApproveBrandAction` updates the status today with no lock, so a concurrent approve and reject could both apply ([audit §3](09-audit-registration-and-errors.md#3-registration-edge-cases)).
  - **Emails** for approved, rejected, suspended and reactivated, in the owner's language. Today approval sends nothing ([audit §2](09-audit-registration-and-errors.md#2-messages-and-rate-limits-today)).
  - The pickers already skip pending brands ([decisions](../decisions-required.md), Admin Brands). Extend the same rule to rejected and suspended brands, and enforce it in the backend as well.
  - **Branch status (D9):** stop the owner setting any `status` through `Dashboard/Http/Requests/Business/BranchRequest.php`, and apply the chosen branch gate. The admin can suspend or reactivate a branch; the activation exists on `admin_api` only today, so add a dashboard route.
- **Dashboard:** the existing brand detail dialog becomes a detail page with Edit, Reject, Suspend or Reactivate, Features and History. Branches get a Suspend or Reactivate action for the admin.
- **Done when:**
  - Pest covers each transition, the lock, the emails, the resubmission cap and the side effects chosen in D8 and D9.
  - E2E covers reject → resubmit → approve, and suspend.

## NS-07: Clients and bans

- **Guards:** admin.
- **Story:** the admin finds a client, sees their account and bookings, and bans or unbans them with a reason and an optional end date.
- **Needs:** [D4](01-decisions.md#d4-what-an-admin-may-see-about-a-client).
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
- **Needs:** [D3](01-decisions.md#d3-how-the-admin-sees-branch-level-records).
- **Backend: Partial.**
  - The Operations routes already allow the admin: chairs, stylists, services, reviews, opening hours, affiliations and job postings.
  - Check in the task that each list works for an admin without a branch scope, and add `brand_id` and `branch_id` filters where they are missing.
- **Dashboard:**
  - admin menu entries;
  - the existing screens reused with a brand and branch filter;
  - read-only where the PRD keeps an action with the branch.
- **Done when:** Pest covers admin scoping on each list, and E2E covers the filter on two of the screens.
