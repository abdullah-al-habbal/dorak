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
- **Needs:** [D5](01-decisions.md#d5-how-notifications-reach-the-dashboard).
- **Backend: New.**
  - The feed (`GET /notifications`, `POST /notifications/read-all`, `PATCH /notifications/{id}/read`) accepts only the `client`, `barber` and `branch_api` guards. Add dashboard routes that resolve the dashboard actor.
  - Admins have no notifications yet, so decide which events to send them.
- **Dashboard:**
  - replace the placeholder `components/layout/notifications-menu.tsx` with the feed and an unread badge;
  - add mark-as-read and mark-all;
  - link each item to its record.
- **Done when:** Pest covers each actor type's scope, and E2E covers a seeded notification marked as read.

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
