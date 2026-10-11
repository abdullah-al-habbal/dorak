# Task 56: Complete Job Board

**Phase:** Phase 8 — Brand, Branch & Barber Platform · **Priority:** P2 · **Depends on:** Task 06, Task 50, Task 31 · **Audit source:** Product-spec audit (Branch/Brand), feature-spec audit (BE-08); `backend/docs/04_house-rules.md:75` (G3), `backend/docs/08_edge-cases.md:109-111` (EC‑20), `backend/docs/06_entity-model-abstract.md:200`

## Overview & Root Cause
Barbers can browse and apply to jobs, but the board is incomplete:
- **Thin profile snapshot (G3).** It stores only name, email and `is_freelancer`, where the spec expects a full profile snapshot.
- **Deleting a branch destroys applications (EC‑20).** Both the posting and its applications cascade-delete; the spec says open jobs close and applications remain.
- **Entity-model status not supported.** The entity model's `submitted/seen` status is not set by the shop.
- **No transition rules on application status.** Task 06 moves the decision to the branch side, but no transitions are enforced.
- **No notifications.** New applications don't notify the shop (Task 31).

## Evidence
- `backend/modules/JobPosting/Eloquent/Resolvers/Barber/ApplyForJobEloquentResolver.php:35-39` — `profile_snapshot` = name, email, is_freelancer.
- `backend/modules/JobPosting/Database/Migrations/0001_01_01_200080_create_job_postings_table.php:16` — `branch_id ... cascadeOnDelete()`.
- `backend/modules/JobPosting/Database/Migrations/0001_01_01_200081_create_job_applications_table.php:16` — `job_posting_id ... cascadeOnDelete()`.
- `backend/modules/JobPosting/Http/Actions/Barber/UpdateApplicationStatusAction.php` — status update sits under the barber guard (moved in Task 06).

## Full-Stack Scope
### Backend (API / DB / Policies)
- Expand the snapshot to include bio (Task 54), portfolio photo URLs, services with prices, rating (Task 42), years/experience if present, and travel radius. Store it as an immutable JSON copy at apply time.
- EC‑20: change the FKs to `nullOnDelete` or soft-delete branches/postings. On branch removal, set open postings to `closed` and keep the applications. Decision required: soft delete vs nullable FK.
- Application status machine: `submitted → seen → (accepted | rejected)`. Mark `seen` automatically when the branch first fetches `GET /branch/job-postings/{id}/applications`. Reject invalid transitions with 422.
- `job_board` gating is done in Task 50; application notifications in Task 31.

### Dashboard (BFF / React)
- Job postings and applicants UI in Task 75 must render the expanded snapshot and the status machine.

### Mobile (Flutter / Repositories)
- `frontend/mobile/packages/core/lib/src/network/repositories/job_posting.repository.dart`: update the application DTO for the new snapshot fields and statuses. stylist_app UI is in Task 83, business_app UI in Task 85.

## Acceptance Criteria
- [ ] `POST /api/v1/jobs/{job}/apply` stores a snapshot containing `services`, `portfolio` and `bio` keys (DB JSON assertion).
- [ ] Editing the barber profile after applying does not change the stored snapshot.
- [ ] Deleting a branch with open postings leaves `job_applications` rows intact, with the postings marked closed (Feature test).
- [ ] The first branch fetch of applicants moves `submitted` to `seen`. `rejected → accepted` returns 422.
- [ ] `php artisan test` passes; PHPStan max + Pint clean.

## Out of Scope
- Moving status updates to the branch guard (Task 06).
- Feature flag (Task 50), notifications (Task 31), UI (Tasks 75, 83, 85).
