# Task 59: Enforce Face Profile Photo Lifecycle

**Phase:** Phase 10 — Client Intelligence · **Priority:** P2 · **Depends on:** Task 07, Task 15, Task 36 · **Audit source:** Product-spec audit (Other / client intelligence), feature-spec audit (BE-13); `backend/docs/04_house-rules.md:144-145` (FACE-2/FACE-3), `backend/docs/02_prd.md:263` (FACE-1)

## Overview & Root Cause
The face profile API is upload-only. Gaps:
- **No 5-photo limit.** The spec caps each client at 5 photos; upload never counts existing ones.
- **More than one primary allowed.** Uploading with `is_primary=true` never clears the previous primary.
- **No list or delete endpoints.**
- **No 30-day purge.** Nothing removes face photos 30 days after account deletion (FACE-3).

Two related fixes are handled elsewhere: private storage in Task 07 and analysis dispatch in Task 15.

## Evidence
- `backend/modules/ClientFaceProfile/Routes/Api/V1/client-face-profile.php` — only `POST /client/face-profile` and `GET /client/face-profile/recommendations`.
- `backend/modules/ClientFaceProfile/Eloquent/Resolvers/UploadFaceProfilePhotoEloquentResolver.php:18` — writes `is_primary` straight from the command; no count or primary reset.
- `backend/modules/ClientFaceProfile/Database/Migrations/2026_07_19_000001_create_client_face_profiles_table.php:18` — `is_primary` boolean with no uniqueness constraint.
- No scheduled purge command for face photos exists (the only scheduled command found is `recommend:recompute-vectors` in `backend/modules/ClientRecommendation/Providers/ClientRecommendationServiceProvider.php:38`).

## Full-Stack Scope
### Backend (API / DB / Policies)
- Upload: if the client already has 5 photos, return 422 `face_photo_limit_reached`. Wrap the count and insert in a transaction with a row lock.
- When `is_primary=true`, unset the others in the same transaction. If it's the client's first photo, make it primary automatically.
- Add `GET /api/v1/client/face-profile` (list, with signed URLs from Task 07), `DELETE /api/v1/client/face-profile/{photo}` (owner-only; deletes the file and the row; reassigns primary if needed), and `PATCH /api/v1/client/face-profile/{photo}/primary`.
- FACE-3: add a scheduled daily command `face-profile:purge`. It deletes the photos and files of clients soft-deleted more than 30 days ago. It depends on the account-deletion flow in Task 36.

### Dashboard (BFF / React)
- None. Face photos are client-private and never shown in the dashboard (FACE-1).

### Mobile (Flutter / Repositories)
- `frontend/mobile/packages/core/lib/src/network/repositories/face_profile.repository.dart` and `frontend/mobile/packages/core/lib/src/network/endpoints/face_profile.endpoints.dart`: add list, delete and setPrimary.
- client_app `frontend/mobile/apps/client_app/lib/src/features/profile/face_analysis.bloc.dart`: photo gallery with delete/primary. Disable upload at 5, and map the `face_photo_limit_reached` error.

## Acceptance Criteria
- [x] A 6th upload returns 422 `face_photo_limit_reached`, and the row count stays 5.
- [x] Uploading with `is_primary=true` leaves exactly one primary row for the client (DB assertion).
- [x] `DELETE /api/v1/client/face-profile/{photo}` by the owner returns 204/200, and the file is removed from storage (`Storage::fake` assertion). Another client gets 403/404.
- [x] `php artisan face-profile:purge` deletes photos of clients soft-deleted more than 30 days ago and keeps those deleted less than 30 days ago (Feature test with time travel).
- [x] The command is registered in the scheduler (test asserts the schedule entry).
- [x] client_app bloc test covers the limit error (`melos run test`).
- [x] `php artisan test` passes; Pint clean. (PHPStan is explicitly exempted as a gate in this repo per `backend/CLAUDE.md`.)

### Implemented contract
- Upload: `UploadFaceProfilePhotoEloquentResolver` wraps the count check, primary reset, and insert in one `DB::transaction` with `lockForUpdate()` on both the owning `ClientModel` row and the existing photo rows, so two concurrent uploads for the same client can't both pass the 5-photo check. The first photo for a client is always made primary even if `is_primary` was omitted or false.
- Limit: exceeding 5 throws `FacePhotoLimitReachedException`, caught in `UploadFaceProfilePhotoAction` and mapped to `422 face_photo_limit_reached`; the already-stored file is deleted from the private disk before returning so no orphaned file remains.
- New endpoints: `GET /api/v1/client/face-profile` (list, oldest first, signed `image_url` per row), `DELETE /api/v1/client/face-profile/{photo}` (owner-only via `ClientFaceProfilePolicy::delete`; deletes the row + file in a transaction and reassigns primary to the oldest remaining photo if the deleted one was primary), `PATCH /api/v1/client/face-profile/{photo}/primary` (owner-only via `::update`; atomically unsets every other row's `is_primary` and sets this one).
- Authorization: new `ClientFaceProfilePolicy` (`view`/`delete`/`update`, all owner-only by `client_id`), registered via `Gate::policy()` in `ClientFaceProfileServiceProvider::afterBoot`. A non-owner gets 403 (Policy-denied), not 404 — the same convention `ClientHistory`'s policies already use (Task 58).
- FACE-3 purge: `face-profile:purge` (daily at 03:00, `withoutOverlapping`) deletes the photo rows and files of every client whose `deleted_at` (via `ClientModel::onlyTrashed()`, Task 36's soft-delete flow) is more than 30 days in the past. Scheduler registration follows the existing `reviews:release-expired-disputes`/`recommend:recompute-vectors` pattern.
- Mobile: `packages/core`'s `FaceProfileRepository` gains `listPhotos`, `deletePhoto`, `setPrimaryPhoto`; `FaceProfileEndpoints`/`ApiEndpoints.faceProfile` expose the three new routes. `client_app`'s `FaceAnalysisBloc` now loads the photo gallery alongside recommendations, exposes `atPhotoLimit`/`photoLimitReached` on `FaceAnalysisState`, rejects a scan client-side once 5 photos are loaded (no network round-trip), and maps a server-side `face_photo_limit_reached` `ApiException` onto the same flag. `FaceAnalysisPhotoDeleted`/`FaceAnalysisPhotoSetPrimary` events update the gallery locally after a successful call. No `.screen.dart` exists for face analysis yet in this app (upload/gallery UI wiring is a future task, same as the rest of this bloc) — only the bloc/repository contract was in this task's scope.
- No decisions needed recording beyond following established repo conventions; nothing in the spec was ambiguous or contradicted by code.

## Out of Scope
- Private disk / signed URLs (Task 07). Analysis job dispatch (Task 15).
- Account deletion rules (Task 36).
- A `.screen.dart` photo-gallery UI for client_app (no such screen exists yet; bloc/repository contract only).
