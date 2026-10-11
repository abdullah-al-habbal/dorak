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
- [ ] A 6th upload returns 422 `face_photo_limit_reached`, and the row count stays 5.
- [ ] Uploading with `is_primary=true` leaves exactly one primary row for the client (DB assertion).
- [ ] `DELETE /api/v1/client/face-profile/{photo}` by the owner returns 204/200, and the file is removed from storage (`Storage::fake` assertion). Another client gets 403/404.
- [ ] `php artisan face-profile:purge` deletes photos of clients soft-deleted more than 30 days ago and keeps those deleted less than 30 days ago (Feature test with time travel).
- [ ] The command is registered in the scheduler (test asserts the schedule entry).
- [ ] client_app bloc test covers the limit error (`melos run test`).
- [ ] `php artisan test` passes; PHPStan max + Pint clean.

## Out of Scope
- Private disk / signed URLs (Task 07). Analysis job dispatch (Task 15).
- Account deletion rules (Task 36).
