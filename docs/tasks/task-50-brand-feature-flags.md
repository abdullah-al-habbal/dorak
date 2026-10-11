# Task 50: Implement Brand Feature Flags

**Phase:** Phase 8 — Brand, Branch & Barber Platform · **Priority:** P2 · **Depends on:** Task 12, Task 49 · **Audit source:** Product-spec audit (Branch/Brand); `backend/docs/04_house-rules.md:12` (A3), `:73` (G1), `:88` (H6), `:96-98` (I2–I4), `backend/docs/08_edge-cases.md:33` (EC‑6)

## Overview & Root Cause
The house rules gate premium capabilities per brand: `multi_branch` controls a second branch (A3) and `job_board` controls job posting (G1). Downgrades must be handled (I3, EC‑6), freelancers are exempt from salon-only gates (I4), and admins manage the flags (H6). None of this exists. Laravel Pennant is installed but only used for the recommendation A/B test, and branch and job-posting creation are ungated.

## Evidence
- `backend/modules/ClientRecommendation/Features/ExploreRankingFeature.php` — the only Pennant feature in the codebase.
- `backend/modules/Core/Database/Migrations/2026_07_19_000010_create_features_table.php` — Pennant storage exists.
- `backend/modules/Dashboard/Eloquent/Resolvers/Branches/StoreBranchEloquentResolver.php` — creates branches with no flag check.
- `backend/modules/Branch/Http/Actions/Branch/CreateJobPostingAction.php` — creates postings with no flag check.

## Full-Stack Scope
### Backend (API / DB / Policies)
- Define brand-scoped flags `multi_branch` and `job_board`. Pennant features scoped to `BrandModel` are the preferred approach because the table already exists.
- Gate `StoreBranch` (2nd+ branch) behind `multi_branch`. When denied, return 403 with code `feature_not_enabled`.
- Gate `branch/job-postings` POST/PUT behind `job_board`. Return 403 `feature_not_enabled`.
- Downgrade (I3/EC‑6): when `multi_branch` is turned off and the brand has more than one branch, keep existing branches, but block creating new ones. Decision required: whether extra branches become read-only or stay operational.
- I4: freelancer barbers are never evaluated against salon-only gates.
- Admin API (H6), on the `admin_api` guard per Task 03: `GET/PATCH /api/v1/admin/brands/{brand}/features`.
- Expose active flags on `BrandResource` (`features: {multi_branch: bool, job_board: bool}`).

### Dashboard (BFF / React)
- Hide or disable "Create branch" and "Job postings" actions when the flag is off, based on `features` in the brand payload.
- The admin flag toggle UI belongs to Task 76; this task only provides the API.

### Mobile (Flutter / Repositories)
- `frontend/mobile/packages/core/lib/src/network/repositories/job_posting.repository.dart` — surface the 403 `feature_not_enabled` error as a typed failure for business_app (Task 85).

## Acceptance Criteria
- [ ] Brand with `multi_branch=false` and 1 branch: `POST /api/v1/dashboard/branches` returns 403 `feature_not_enabled`. With the flag on, it returns 201.
- [ ] Brand with `job_board=false`: `POST /api/v1/branch/job-postings` returns 403. With the flag on, it returns 201.
- [ ] Turning `multi_branch` off on a brand with 3 branches leaves all 3 rows in place, and creating a 4th returns 403.
- [ ] `PATCH /api/v1/admin/brands/{brand}/features` with a non-admin token returns 401/403. With an admin token it returns 200 and persists the flag.
- [ ] `BrandResource` includes the `features` object (resource test).
- [ ] `php artisan test` passes; PHPStan max + Pint clean.

## Out of Scope
- Subscription billing that would toggle flags automatically (Task 65).
- Floor-plan designer premium gate (not yet specified).
