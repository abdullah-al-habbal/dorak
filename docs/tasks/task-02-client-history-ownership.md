# Task 02: Fix Client History Ownership (Rebook & Media)

**Phase:** 1 — Security & Authorization · **Priority:** P0 · **Depends on:** None · **Audit source:** Backend route audit (NoAuthz: `client/history/{history}/media`, `client/history/{history}/rebook`)

## Overview & Root Cause
Two client history routes never scope the history record to the authenticated client:
- The rebook resolver loads any history record by ID and creates a booking from it.
- The media resolver inserts media for any `history_id` without knowing which client is calling.

Any client can therefore rebook another client's barber and service, or attach photos to another client's history (IDOR).

## Evidence
- `backend/modules/ClientHistory/Routes/Api/V1/client-history.php:10-13`: routes are under `auth:client` only.
- `backend/modules/ClientHistory/Eloquent/Resolvers/RebookFromHistoryEloquentResolver.php:16`: `ClientServiceHistoryModel::findOrFail($command->historyId)`, not scoped to the client.
- `backend/modules/ClientHistory/Eloquent/Resolvers/AttachHistoryMediaEloquentResolver.php:14-15`: `ClientServiceHistoryMediaModel::create(['history_id' => ...])`, with no client ID passed.
- `backend/modules/ClientHistory/Http/Requests/Client/AttachHistoryMediaRequest.php`: no ownership check in `authorize()`.

## Full-Stack Scope
### Backend (API / DB / Policies)
- Add `ClientServiceHistoryPolicy::view()`, which allows the action only when `history.client_id === auth('client')->id()`.
- In `RebookFromHistoryRequest` and `AttachHistoryMediaRequest`, `authorize()` must load the history and apply the policy. Return 404 when the history does not exist and 403 when another client owns it.
- Pass `clientId` into the attach-media command, and have the resolver verify ownership as defence in depth.

### Dashboard (BFF / React)
- None. The dashboard does not use client history routes.

### Mobile (Flutter / Repositories)
- `frontend/mobile/packages/core/lib/src/network/repositories/history.repository.dart`: no contract change. `rebookFromHistory` and `attachMedia` must surface 403 as a typed error.
- `frontend/mobile/apps/client_app/lib/src/features/profile/history.bloc.dart`: map 403/404 on rebook to an error state instead of an unhandled exception.

## Acceptance Criteria
- [ ] `POST /api/v1/client/history/{foreignHistory}/rebook` returns 403, and no booking row is created.
- [ ] `POST /api/v1/client/history/{foreignHistory}/media` returns 403, and no media row is created.
- [ ] Both routes return 404 for a history ID that does not exist.
- [ ] The owner's rebook and media requests keep their current success status codes.
- [ ] Feature test `tests/Feature/ClientHistory/ClientHistoryOwnershipTest.php` covers the four cases.
- [ ] `php artisan test` passes; PHPStan (max) and Pint are clean for touched files.

## Out of Scope
- Routing rebook through the booking engine (overlap check, `pending` status, notifications): Task 19.
- History media as an uploaded file instead of a URL: Task 58.
