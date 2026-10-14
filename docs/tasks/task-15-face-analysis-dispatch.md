# Task 15: Dispatch Face Analysis on Photo Upload

**Phase:** 2 — Data Integrity & Broken Pipelines · **Priority:** P0 · **Depends on:** Task 07 · **Audit source:** Feature audit BE-13 (upload dispatches `AnalyzeFacePhotoJob`, Missing); product audit (FACE-2, `02_prd.md:264`); verified in code by the parent session

## Overview & Root Cause
The upload endpoint stores the photo and returns. Nothing queues the AI analysis:
- `RequestFaceAnalysisHandler` dispatches `AnalyzeFacePhotoJob`, but **no code calls it**.
- A real AI pipeline exists (`FaceAnalysisService`, `FaceShapeAnalyzerAgent`), but it never runs from the API.

As a result, `GET /client/face-profile/recommendations` stays empty, and the recommendation engine's face signal is never populated.

## Evidence
- `backend/modules/ClientFaceProfile/Handlers/RequestFaceAnalysisHandler.php:14`: `AnalyzeFacePhotoJob::dispatch(...)`; grep finds no callers in `modules/` or `tests/`.
- `backend/modules/ClientFaceProfile/Http/Actions/Client/UploadFaceProfilePhotoAction.php`: no dispatch after storing.
- `backend/modules/ClientFaceProfile/Jobs/AnalyzeFacePhotoJob.php` and `backend/modules/ClientFaceProfile/Services/FaceAnalysisService.php`: the pipeline exists.
- `backend/modules/ClientFaceProfile/Routes/Api/V1/client-face-profile.php:10-11`: upload and recommendations routes.
- `frontend/mobile/apps/client_app/lib/src/features/profile/face_analysis.bloc.dart`: the mobile flow expects analysis results.

## Full-Stack Scope
### Backend (API / DB / Policies)
- After a successful upload, call `RequestFaceAnalysisHandler` from the upload handler (`UploadFaceProfilePhotoHandler`), after the DB commit.
- Expose analysis status on the face profile resource: `analysis_status` = `pending` | `completed` | `failed`, persisted on the face profile row. The job sets `completed` or `failed`.
- On job failure, follow the job's retry policy; after the final failure, set `failed` and log the error. The upload must never fail because of the AI step.

### Dashboard (BFF / React)
- None.

### Mobile (Flutter / Repositories)
- `frontend/mobile/packages/core/lib/src/network/dto/face_photo.dto.dart`: add `analysisStatus`.
- `frontend/mobile/apps/client_app/lib/src/features/profile/face_analysis.bloc.dart`:
  - after upload, poll the authenticated `GET /api/v1/client/face-profile/{profile}` status route until `analysis_status != pending`, with a bounded number of attempts and backoff;
  - show `failed` as a retryable error.

**Contract decision:** Keep the existing recommendations array response unchanged. Add an authenticated face-profile read route keyed by the upload response's profile ID so clients can distinguish pending, completed, and failed analysis.

## Acceptance Criteria
- [x] `POST /api/v1/client/face-profile` with `Queue::fake()` asserts that `AnalyzeFacePhotoJob` was pushed once, with the new profile ID and client ID.
- [x] Running the job synchronously with a faked AI response stores a result, and `GET /api/v1/client/face-profile/recommendations` returns a non-empty payload.
- [x] A job failure (faked exception) results in `analysis_status = failed`, and the upload response was still 201.
- [x] Feature test `tests/Feature/ClientFaceProfile/FaceAnalysisDispatchTest.php` covers the three cases above.
- [x] Mobile bloc test: the upload → pending → completed state sequence is emitted.
- [x] `php artisan test` and `melos run test` pass; PHPStan (max) and Pint are clean for touched files.

## Out of Scope
- Private photo storage: Task 07.
- Photo limits, the single primary photo and the purge: Task 59.
- Feeding face signals into recommendation vectors: Task 62.
