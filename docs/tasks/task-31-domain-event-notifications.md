# Task 31: Notify on Invitations, Applications and Review Requests

**Phase:** Notifications & Realtime · **Priority:** P2 · **Depends on:** Task 28, Task 30 · **Audit source:** Product-spec audit (Notifications: invitation, application, review request Missing); `07_user-flows.md:131` (notify invitation), `07_user-flows.md:148` (profile snapshot to shop, G3), `07_user-flows.md:165` (invite both sides to review, F1)

## Overview & Root Cause
The user flows require three notifications that are never sent:
- the barber is notified of an affiliation invitation;
- the shop is notified of a job application;
- after completion, both client and shop are asked to review.

Today, `FcmNotificationSender` is only called from the booking notification job and a Filament activation action. None of the affiliation, job or review modules notify anyone.

## Evidence
- A grep for `FcmNotificationSender`, `Notification::` and `->notify(` in `backend/modules` matches only `Booking/Jobs/SendBookingStatusNotificationJob.php`, `Core/Services/FcmNotificationSender.php` and `Activation/Filament/Actions/ToggleActivationAction.php`.
  - Task 30 re-check (2026-10-22): `ToggleActivationAction` no longer calls the sender; the booking job is its only caller. Task 30 added `FcmNotificationSender::sendTo(..., NotificationTypeEnum $type, ..., ?string $dispatchKey)` and `NotificationWriter`; new jobs should pass a stable dispatch key and the matching `NotificationTypeEnum` case.
- `backend/modules/BarberAffiliation/Http/Actions/Barber/CreateAffiliationAction.php` — creates an affiliation with no notification.
- `backend/modules/JobPosting/Http/Actions/Barber/ApplyForJobAction.php` — creates an application with no notification.
- `backend/modules/Booking/Http/Actions/Barber/CompleteBookingAction.php` — completion sends the booking-status push only. There is no review request.

## Full-Stack Scope
### Backend (API / DB / Policies)
- Add queued jobs that go through the Task 30 notification writer:
  - `AffiliationInvitedNotification` → the invited party. The barber when a shop invites them; the shop or branch when a barber requests. Invite direction is completed in Task 55.
  - `AffiliationRespondedNotification` → the requester, on accept or reject.
  - `JobApplicationReceivedNotification` → the branch that owns the posting, with an application ID payload.
  - `JobApplicationStatusChangedNotification` → the applying barber (on the Task 06 status change).
  - `ReviewRequestNotification` → the client after `completed`, and the branch once two-way reviews exist (Task 40).
- Dispatch everything after commit. Payloads carry IDs only.

### Dashboard (BFF / React)
- Notification bell (Task 30) renders the new `type` values, with links to the affiliation, job application and booking pages (pages come from Tasks 70 and 75).

### Mobile (Flutter / Repositories)
- `frontend/mobile/packages/core/lib/src/notifications/push_notification.client.dart` — route the new `type` values:
  - `review_request` → the client app review screen for that booking;
  - `invite`, `application` → stylist and business app screens once Tasks 83 and 85 exist.

### Implemented contract
- Shared code path: five queued jobs (`AffiliationInvitedNotification`, `AffiliationRespondedNotification`, `JobApplicationReceivedNotification`, `JobApplicationStatusChangedNotification`, `ReviewRequestNotification`) → `FcmNotificationSender::sendTo()`. Dispatched `->afterCommit()` from `CreateAffiliationAction`, barber and branch `Accept|RejectAffiliationAction`, `ApplyForJobAction`, `UpdateApplicationStatusAction` and `BookingTransitionNotifier::statusChanged` (covers barber, branch and dashboard completion).
- Scope of the rule: notify only after the success path, so 401/403/422/400/409 queue nothing. Invitations go to the branch for barber-initiated requests (to the barber for shop-initiated ones); responses go to the initiator; review requests go to the booking's client only for completed bookings with a chair/branch to review, never for client-actor transitions.
- Success: jobs write one inbox row per recipient (`invite` / `application` / `review_request`) with ID-only `data {type, event, affiliation_id|application_id|job_posting_id|booking_id, status?}`.
- Dashboard: `notification-link.util.ts` + bell click navigation (booking updates open the booking page for admin/manager; other types have no target until Tasks 70/75/40). Mobile: core `NotificationTarget` + `PushNotificationService.opened/takeInitialTarget`; client_app opens `review_request` → review screen and `booking_update` → bookings (inbox rows and pushes, deferred until signed in); stylist_app/business_app route to their landing screen. ARB empty-state copy generalised (en+ar). Docs: backend and mobile feature indexes, client_app `AGENTS.md`.
- Deviations from the original spec text: invite/application mobile screens do not exist (Tasks 83/85), so those pushes land on the app landing screen. The spec's `push_notification.client.dart` held no routing; the resolver is new in `notification_target.entity.dart`.

#### Decisions (resolved)
- **Brand-targeted affiliation requests are skipped:** `BrandModel` is not a notifiable actor.
- **Coverage is API paths only:** Filament direct edits are out of scope; branch-side affiliation actions are included.
- **Review request is client-only:** the branch side waits for Task 40.

## Acceptance Criteria
- [x] `POST /api/v1/barbers/{barber}/affiliate` queues exactly one `AffiliationInvitedNotification` to the counterparty (`Queue::fake`).
- [x] Accept and reject each queue one `AffiliationRespondedNotification`.
- [x] `POST /api/v1/jobs/{job}/apply` queues one `JobApplicationReceivedNotification` to the posting's branch.
- [x] Completing a booking queues one `ReviewRequestNotification` to the booking's client.
- [x] No notification is queued when the triggering request fails validation or authorization.
- [x] Feature test `DomainEventNotificationTest` covers all of the above.
- [x] Mobile: `push_notification.client.dart` unit test maps `review_request` to the review route.
- [x] `php artisan test` and `melos run test` pass. PHPStan max and Pint are clean. (PHPStan was intentionally not run at the user's instruction; Pint was run.)

## Out of Scope
- Two-way review submission (Task 40).
- Shop-initiated invites (Task 55).
- Branch-side application decisions (Task 06).
