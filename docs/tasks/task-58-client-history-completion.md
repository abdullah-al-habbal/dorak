# Task 58: Complete Client History

**Phase:** Phase 10 — Client Intelligence · **Priority:** P2 · **Depends on:** Task 02, Task 07, Task 13, Task 55 · **Audit source:** Product-spec audit (Other / client intelligence), feature-spec audit (BE-12); `backend/docs/02_prd.md:254-257` (HIST-1/3/4), `backend/docs/04_house-rules.md:142` (HIST-3 barber read)

## Overview & Root Cause
- **Only one service recorded per booking.** History rows are auto-created when a booking completes, but only the booking's first service is recorded (HIST-1).
- **Private notes and rating can't be filled.** `client_rating`, `client_notes` and `barber_notes` are columns returned by the resource, but no endpoint or sync writes them (HIST-4).
- **Media takes a URL, not an upload.** The media endpoint accepts a `photo_url` string instead of an uploaded file (HIST-3 before/after photos).
- **Barbers can't read history.** House rule HIST-3 says barbers get read access to a client's history when the client books with them, but no barber route exists.

## Evidence
- `backend/modules/ClientHistory/Observers/BookingCompletedObserver.php:29` — `$booking->services->first()`.
- `backend/modules/ClientHistory/Http/Requests/Client/AttachHistoryMediaRequest.php:17` — `photo_url` string, max 2048.
- `backend/modules/ClientHistory/Http/Resources/ClientServiceHistoryResource.php:22-24` — exposes `client_rating`, `client_notes`, `barber_notes`.
- `backend/modules/ClientHistory/Http/Actions/Client/` — only List, AttachMedia and Rebook actions; no update action and no barber-context actions.

## Full-Stack Scope
### Backend (API / DB / Policies)
- HIST-1: record all booking services. Decision required: one history row per service, or one row with an `offered_service_ids` JSON/pivot. The observer must not fail when `barber_id` is null (Task 13).
- HIST-4: add `PATCH /api/v1/client/history/{history}` (owner-only, per the Task 02 policy) accepting `client_rating` (1–5) and `client_notes`. Add `PATCH /api/v1/barber/history/{history}/notes` for `barber_notes`. A barber may edit only rows where they are the booking's barber.
- HIST-3 photos: change the media request to a multipart `photo` file (image, max size defined). Store it on a private disk and serve signed URLs, following the Task 07 approach.
- HIST-3 barber read: add `GET /api/v1/barber/clients/{client}/history` (auth:barber). Allow only if the client has a booking with this barber (Decision required: any past booking, or an upcoming/active one only).

### Dashboard (BFF / React)
- Barber workspace: client history panel from the appointment card (Task 69 consumes it). No new BFF beyond the barber allowlist entry (Task 11 rules).

### Mobile (Flutter / Repositories)
- `frontend/mobile/packages/core/lib/src/network/repositories/history.repository.dart`: change `attachMedia` to a multipart upload, and add `updateEntry` (rating, notes).
- client_app history screens (`frontend/mobile/apps/client_app/lib/src/features/profile/history.bloc.dart`): add note/rating edit and photo picker (wiring tracked with Task 80).
- stylist_app: client history view from the appointment (Task 83).

## Acceptance Criteria
- [ ] Completing a booking with 3 services records all 3 services in history (Feature test).
- [ ] `PATCH /api/v1/client/history/{id}` by the owner returns 200 and persists rating/notes. Another client gets 403/404. `client_rating=6` returns 422.
- [ ] `POST /api/v1/client/history/{id}/media` with a multipart image returns 201. The stored file is not on the `public` disk, and the response URL is signed/expiring.
- [ ] `GET /api/v1/barber/clients/{client}/history` returns 200 for a barber with a qualifying booking and 403 otherwise.
- [ ] Mobile repository multipart test passes (`melos run test`).
- [ ] `php artisan test` passes; PHPStan max + Pint clean.

## Out of Scope
- Ownership fix on existing rebook/media routes (Task 02).
- Rebook engine behavior (Task 19). Anonymization on account delete (Task 36).
