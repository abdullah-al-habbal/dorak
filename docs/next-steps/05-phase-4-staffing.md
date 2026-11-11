---
nodeid: docs.next_steps.phase_4
parentnode: docs.next_steps
childnodes: []
codeanchors:
  - backend/modules/Dashboard/
  - backend/modules/BarberAffiliation/
  - backend/modules/JobPosting/
  - frontend/web/dashboard/src/
---

# Phase 4: Staffing and Signature Features

Routes: [index](index.md).

The backend is ready for all four tasks, so only the allow-list rules and the screens are missing. Today, managers add stylists directly on the Stylists screen. These tasks add the PRD's marketplace flows and the floor plan, its signature feature. `business_app` already has `floor_plan`, `affiliations` and `jobs` features to use as references.

## NS-15: Floor plan editor

- **Guards:** manager, owner.
- **Story:** a manager arranges the chairs on a plan of the shop, and clients see the layout when they book (PRD 4.3).
- **Backend: Ready.** `GET|PATCH /branches/{branch}/floor-plan`.
- **Dashboard:**
  - a visual editor on the Chairs screen: place, move, rotate and label;
  - a keyboard alternative to dragging;
  - a read-only view on phones.
  - No new package without asking.
- **Done when:**
  - Vitest covers the layout maths.
  - E2E covers saving and reloading a layout, and keyboard placement.


### NS-15 as built

- **Backend:** no change. `GET|PATCH /branches/{branch}/floor-plan` carries the preset, zones, canvas and decorations, and each chair's placement is its `layout_settings`, saved through the existing `PUT /chairs/{id}`.
- **Dashboard:** the Chairs screen has a List / Floor plan switch. The plan is an SVG editor built without a new package: drag a chair or decoration, or select it and use the arrow keys (Shift for bigger steps), `[` and `]` to rotate a chair, Delete to remove a decoration, or type exact values in the inspector. The toolbar sets the layout preset (a zoned preset saves a men and a women half), the canvas size and unit, and adds decorations. Saving writes the layout, then each chair that moved. Chair positions and sizes are saved in stage units (a stage 1000 units wide, as tall as the canvas ratio makes it); decorations and zones are percent of the canvas. Below 768 px wide, and for the platform admin, the plan is read-only. The proxy allows `GET` and `PATCH` for the operations guards.
- **Not done:** tests (skipped by instruction, so the layout maths has no Vitest yet); the zone rectangles are fixed halves, not draggable; a chair's zone is still set in its own form.
## NS-16: Barber invitations

- **Guards:** manager, owner.
- **Story:** a manager invites an existing barber to the branch, accepts or rejects a barber's request to join, and ends an affiliation.
- **Backend: Ready.**
  - `GET|POST /branches/{branch}/affiliations`;
  - `.../{affiliation}/accept|reject|terminate`.
- **Dashboard:** an "Invitations" tab on Stylists, with pending, active and ended lists, and actions behind confirmations.
- **Done when:** E2E covers invite, then accept (seeded), then terminate.

### NS-16 as built

- **Backend:** one new read route, `GET /barber-lookup?search=` (manager and owner), returning `id` and `name` of at most ten discoverable barbers matched by name, or by exact email or phone; three characters minimum. The affiliation routes already existed and are unchanged.
- **Dashboard:** the Stylists screen has a List / Invitations switch. The Invitations panel lists pending, active and ended affiliations; the "Invite a barber" dialog searches the lookup and sends the invitation. Accept, reject and end are behind confirmations. The proxy allows reading for every branch guard and writing for manager and owner only; the admin keeps read-only oversight through NS-09's branch pages.
- **Mobile:** no change, the existing contract is untouched.
- **Not done:** tests (skipped by instruction).

## NS-17: Job postings and applications

- **Guards:** manager, owner.
- **Story:** a manager posts a vacancy, reviews the applications and moves each one through its statuses (PRD 4.8).
- **Backend: Ready.**
  - `GET|POST|PUT|DELETE /branches/{branch}/job-postings`;
  - `.../applications` and the application status route.
- **Dashboard:** a "Jobs" screen with the postings, an application list per posting, and status changes. Accepting an applicant should lead into NS-16.
- **Done when:** E2E covers posting, an application's status change, and closing the posting.

### NS-17 as built

- **Backend:** no change. The job-posting and application routes under `/branches/{branch}/job-postings` were already on the dashboard API; the job board stays gated by the brand's plan feature (a 403 shows "your plan doesn't include the job board").
- **Dashboard:** a "Job postings" screen for managers and owners (an owner picks the branch). Each posting shows its status, type, location and application count. The create / edit dialog takes both languages and, when editing, a status (close or reopen) and a delete behind a confirmation. "Applications" opens the applicants (the barber's profile as it was when they applied) with accept and reject; an accepted applicant has "Invite to branch", which opens the NS-16 invitation dialog with the barber already chosen. The proxy allows reading for every branch guard and writing for manager and owner only.
- **Mobile:** no change.
- **Not done:** tests (skipped by instruction); the "seen" status is set by the backend when the list opens, so there is no manual control for it.

## NS-18: Per-brand stylist pricing

- **Guards:** owner.
- **Story:** an owner sets a stylist's price and duration for a service in their brand, overriding the default.
- **Backend: Ready.** `GET /barbers/{barber}/services` and `PUT|DELETE /barbers/{barber}/services/{service}/override`. Audit finding G6 counted this page as built, but it doesn't exist in this dashboard.
- **Dashboard:** a "Pricing" tab in the stylist's detail page, showing the default and the override, with a reset action.
- **Done when:** E2E covers setting and clearing an override, and checks that the booking price follows it.
