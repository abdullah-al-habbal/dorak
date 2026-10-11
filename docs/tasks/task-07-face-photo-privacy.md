# Task 07: Store Face Photos Privately with Signed Access

**Phase:** 1 — Security & Authorization · **Priority:** P0 · **Depends on:** None · **Audit source:** Product audit, Client intelligence (FACE-1); `backend/docs/04_house-rules.md` (FACE-1: "the photo is never publicly visible")

## Overview & Root Cause
Face photos are biometric-adjacent personal data. The house rules forbid public visibility, but the upload action stores them on the `public` disk and persists a permanent public URL in `image_url`. Anyone who has or guesses the URL can view the photo with no authentication.

The AI analysis service also depends on the public disk, because it rebuilds a path from the public URL.

## Evidence
- `backend/modules/ClientFaceProfile/Http/Actions/Client/UploadFaceProfilePhotoAction.php:23-24`: `$file->store('face-profiles', 'public')` and `Storage::disk('public')->url($path)`.
- `backend/modules/ClientFaceProfile/Services/FaceAnalysisService.php:23,29-34`: builds a `StoredImage(..., 'public')` by stripping `/storage/` from the URL.
- `backend/modules/ClientFaceProfile/Http/Resources/ClientFaceProfileResource.php:15` and `ClientFaceAnalysisResultResource.php:25`: expose the raw `image_url`.
- `frontend/mobile/packages/core/lib/src/network/dto/face_photo.dto.dart:8`: `imageUrl` is required.
- `frontend/mobile/apps/client_app/lib/src/features/profile/widgets/face_card.widget.dart:84`: renders `faceProfile?.imageUrl`.

## Full-Stack Scope
### Backend (API / DB / Policies)
- Store uploads on a private disk (for example `local`, or a private S3 bucket), under `face-profiles/{client_id}/`.
- Add an `image_path` column. Stop persisting public URLs, and drop `image_url` or leave it null after migration.
- Write a data migration that moves existing files from the public disk to the private disk, backfills `image_path`, and deletes the public copies.
- Resources return a short-lived signed URL (for example `Storage::temporaryUrl` or a signed route `GET /client/face-profile/{profile}/photo` with an ownership check), valid for 15 minutes or less. Keep the JSON key `image_url` so the mobile contract stays stable.
- `FaceAnalysisService` reads from the private disk via `image_path`.

### Dashboard (BFF / React)
- None. The dashboard does not show face photos.

### Mobile (Flutter / Repositories)
- `frontend/mobile/packages/core/lib/src/network/dto/face_photo.dto.dart`: no shape change. Treat `imageUrl` as expiring and do not cache it beyond the session.
- `frontend/mobile/apps/client_app/lib/src/features/profile/widgets/face_card.widget.dart`: on an image load error (expired URL), re-fetch the face profile instead of showing a broken image.

## Acceptance Criteria
- [ ] After upload, no file exists under `storage/app/public/face-profiles/`; the file exists on the private disk.
- [ ] An unauthenticated `GET` of the returned `image_url` after expiry returns 403 (signed route) or the provider's expired-signature error.
- [ ] A signed photo route requested by another client returns 403.
- [ ] `AnalyzeFacePhotoJob` succeeds against a privately stored photo (unit test with `Storage::fake('local')`).
- [ ] The migration moves existing public files; a test asserts the public copy is removed.
- [ ] Feature test `tests/Feature/ClientFaceProfile/FacePhotoPrivacyTest.php` covers the cases above.
- [ ] `php artisan test` and `melos run test` pass; PHPStan (max) and Pint are clean for touched files.

## Out of Scope
- Dispatching analysis on upload: Task 15.
- The 5-photo limit, single primary photo, list/delete endpoints and the 30-day purge: Task 59.
