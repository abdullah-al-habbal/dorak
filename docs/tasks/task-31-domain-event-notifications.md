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

## Acceptance Criteria
- [ ] `POST /api/v1/barbers/{barber}/affiliate` queues exactly one `AffiliationInvitedNotification` to the counterparty (`Queue::fake`).
- [ ] Accept and reject each queue one `AffiliationRespondedNotification`.
- [ ] `POST /api/v1/jobs/{job}/apply` queues one `JobApplicationReceivedNotification` to the posting's branch.
- [ ] Completing a booking queues one `ReviewRequestNotification` to the booking's client.
- [ ] No notification is queued when the triggering request fails validation or authorization.
- [ ] Feature test `DomainEventNotificationTest` covers all of the above.
- [ ] Mobile: `push_notification.client.dart` unit test maps `review_request` to the review route.
- [ ] `php artisan test` and `melos run test` pass. PHPStan max and Pint are clean.

## Out of Scope
- Two-way review submission (Task 40).
- Shop-initiated invites (Task 55).
- Branch-side application decisions (Task 06).
