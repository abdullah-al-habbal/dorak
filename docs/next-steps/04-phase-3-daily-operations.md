---
nodeid: docs.next_steps.phase_3
parentnode: docs.next_steps
childnodes: []
codeanchors:
  - backend/modules/Dashboard/
  - backend/modules/Core/
  - backend/modules/Branch/
  - backend/modules/Review/
  - frontend/web/dashboard/src/
---

# Phase 3: The Daily Routine Needs No Workaround

Routes: [index](index.md) · [decisions](01-decisions.md).

The core business loop already works:

- a client books in the mobile app;
- the manager handles bookings, walk-ins, reschedules, cancellations and status changes;
- earnings and payouts follow.

These tasks remove the places where a manager or owner has to refresh, switch to the mobile app, or borrow another account.

## NS-10: Notifications feed in the dashboard

- **Guards:** all four. The admin gets platform events, such as a new brand to approve or a new dispute.
- **Story:** a manager sees a new or cancelled booking without refreshing, and an admin sees new work in their queues.
- **Decision:** [D5](01-decisions.md#d5-how-notifications-reach-the-dashboard), resolved: poll the unread count every **60 s** while the tab is visible, and on sign-in. No realtime channel at launch.
- **Backend: New.**
  - The feed (`GET /notifications`, `POST /notifications/read-all`, `PATCH /notifications/{id}/read`) accepts only the `client`, `barber` and `branch_api` guards. Add dashboard routes that resolve the dashboard actor.
  - Admins have no notifications yet. Send them at least these events:
    - a verified brand submitted (NS-03);
    - a barber awaiting approval (NS-30);
    - a review disputed (NS-14).
  - Owners get: brand approved, rejected, suspended or reactivated (NS-06).
  - Barbers get: approved or rejected (NS-30), alongside the emails those tasks send.
- **Dashboard:**
  - replace the placeholder `components/layout/notifications-menu.tsx` with the feed and an unread badge;
  - add mark-as-read and mark-all;
  - link each item to its record.
- **Done when:** Pest covers each actor type's scope, and E2E covers a seeded notification marked as read.


### NS-10 as built

- **Backend:** dashboard routes for every actor type: `GET /dashboard/notifications` (paginated, `meta.unread_count`, optional `unread=1`), `POST /notifications/read-all` and `PATCH /notifications/{id}/read`. `DashboardNotificationScope` limits every read and write to the signed-in account's own rows by its morph type and id, so another account's row answers 404. The new `PlatformNotifier` writes inbox rows for the `PlatformEventEnum` events: a verified brand submitted, a barber awaiting approval (verified sign-up or resubmission) and a review disputed go to every active admin; brand approved, rejected, suspended and reactivated go to the owner; barber approved and rejected go to the barber. The rows are written beside the existing emails, and a failed write never breaks the business action. Manager rows (booking pushes to a branch) already existed and now reach the dashboard through the same feed.
- **Dashboard:** the bell shows an unread badge, refetches every 60 seconds while the tab is visible (D5), lists the latest 20 with localized text from the event key, links each row to its record and offers mark-as-read and mark-all. The proxy allows `GET notifications`, `POST notifications/read-all` and `PATCH notifications/{id}/read` for every actor.
- **Not done:** tests (skipped by instruction); a full notifications page with paging (the bell shows the latest 20); admin events for disputes raised from the dashboard (NS-14 reuses the same dispute handler, so they are covered once it exists); push delivery of these events.


### NS-11 as built

- **Backend:** `POST /bookings/{id}/review` already existed (one rating per booking, completed or no-show only, scoped to the branch). The staff booking payload now carries `client_review` (`rating`, `body`, `created_at`, or null), so the dashboard shows the given rating instead of offering the action again. The field is additive for the mobile apps.
- **Dashboard:** the booking detail shows "Rate client" for a completed or no-show booking without a rating, opening a dialog with 1 to 5 stars and an optional note; once rated, the detail shows the stars and note. A 409 answers "already rated".
- **Not done:** tests (skipped by instruction).


### NS-12 as built

- **Backend:** dashboard routes `GET /branches/{branch}/hours-overrides` (from today on, soonest first), `PUT` and `DELETE /branches/{branch}/hours-overrides/{date}`, resolved through `ScopedBranchResolver` (a branch outside the actor's scope answers 404) and `ensureBranchManageable`. Setting a past date is rejected; setting a date again replaces its earlier exception. They reuse `BranchHours::setOverride/clearOverride`, the same logic the branch account's routes use, so availability already honours a closed or shortened day.
- **Dashboard:** a "Special days" section under the weekly editor on Working hours, to add a closed day or special hours for a date, list the upcoming ones and remove them. The proxy allows `GET` and `PUT|DELETE` for admin, manager and owner.
- **Not done:** tests (skipped by instruction); a date range or recurring closures (one date at a time).

## NS-11: Rate the client after a visit

- **Guards:** manager, owner.
- **Story:** after a completed booking, the shop rates the client. Reviews go both ways in the PRD (4.7).
- **Backend: Ready.** `POST /bookings/{booking}/review` is routed and already allow-listed. No screen calls it.
- **Dashboard:** a "Rate client" action on a completed booking's detail, which shows the existing rating once one is given.
- **Done when:** Vitest covers the schema, and E2E covers rating a completed seeded booking.

## NS-12: Closure days and special hours

- **Guards:** manager, owner.
- **Story:** a manager closes the shop on a holiday or shortens one day's hours, so clients can't book those slots.
- **Backend: Partial.** The `branch_hours_overrides` table and `PUT|DELETE /branch/hours-overrides/{date}` exist on the mobile branch API only. Add dashboard routes, including a list route.
- **Dashboard:** a "Special days" section on Working hours.
- **Done when:**
  - Pest covers a closed day removing availability.
  - E2E covers adding and removing a closure.

## NS-13: Owner workspace

- **Guards:** owner.
- **Story:** an owner fixes their brand profile, opens a second brand, and checks any branch's chairs, services and reviews without the manager's login.
- **Backend: Ready.**
  - `GET|PUT /brands/{brand}`, and `POST /brands` for an existing owner.
  - Chairs, services and reviews are on the Operations routes, which allow owners.
- **Dashboard:**
  - a "Brand" page with profile edit and "Add a brand" (new brands go to approval);
  - owner menu entries for Chairs, Services and Reviews, reusing the manager screens with a branch filter.
- **Done when:** E2E covers the brand edit and the owner's view of each screen.

## NS-14: Dispute a review from the dashboard

- **Guards:** manager, owner.
- **Story:** a shop flags an unfair review for the platform team to judge (NS-05).
- **Backend: Partial.** `POST /branch/reviews/{review}/dispute` exists on the mobile branch API only. Add a dashboard route for the branch's reviews.
- **Dashboard:** a "Dispute" action with a reason on the Reviews screen, which then shows the dispute status.
- **Done when:** E2E covers dispute here, then resolve in NS-05.
