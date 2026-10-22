# Task 12: Enforce Branch Manager Scope and Last-Branch Guard

**Phase:** 1 — Security & Authorization · **Priority:** P0 · **Depends on:** None (Task 38 later grants Brand Owners branch creation) · **Audit source:** Product audit, Branch/Brand section (H3, A2); `backend/docs/04_house-rules.md:11` (A2) and `:85` (H3)

## Overview & Root Cause
House rule H3 says a Branch Manager **cannot** open new branches or touch other branches. A2 says a Brand always has at least one Branch.

The dashboard `StoreBranchAction` and `DestroyBranchAction` allow any branch-manager actor whose brand matches, so a manager can create sibling branches and delete any branch in the brand, including their own. `DestroyBranchEloquentResolver` deletes unconditionally, so the last branch of a brand can be removed and the brand is left with zero branches.

## Evidence
- `backend/modules/Dashboard/Http/Actions/Branches/StoreBranchAction.php:20`: allows `isBranchManager()` when `brandId` matches.
- `backend/modules/Dashboard/Http/Actions/Branches/DestroyBranchAction.php:21`: same pattern for delete.
- `backend/modules/Dashboard/Eloquent/Resolvers/Branches/DestroyBranchEloquentResolver.php`: `$branch->delete()` with no last-branch check.
- `backend/modules/Dashboard/Eloquent/Resolvers/Branches/StoreBranchEloquentResolver.php`: unconditional `create`.
- `backend/modules/Dashboard/Routes/Api/V1/dashboard.php:73,75`: `POST /branches` and `DELETE /branches/{branch}`.
- `frontend/dashboard/src/app/(portals)/manager/branches/create`: the manager portal exposes a create-branch page.

## Full-Stack Scope
### Backend (API / DB / Policies)
- `StoreBranchAction` and `DestroyBranchAction`: allow only the platform admin. Brand Owner access is added in Task 38. Branch managers get 403. Note (Task 38): brand owners may now create, update and delete branches of brands they own via `DashboardActor::canManageBrand()`.
- `UpdateBranchAction`: a branch manager may update **only their own branch** (`actor.branchId === branch.id`), not siblings.
- `DestroyBranchEloquentResolver`: if the branch is the brand's last remaining branch, refuse with 409 (`ErrorCodeEnum::CONFLICT`).
- Decision resolved: block branch deletion with HTTP 409 while future bookings remain; do not cancel bookings or send notifications as part of deletion.

### Dashboard (BFF / React)
- Remove `frontend/dashboard/src/app/(portals)/manager/branches/create` and hide the create and delete actions in the manager branches list (`frontend/dashboard/src/app/(portals)/manager/branches/page.tsx`).
- The manager branches list should show only the manager's own branch, or redirect to its detail page.
- The admin branch delete action shows the 409 "last branch" message.

### Mobile (Flutter / Repositories)
- None. The business app has no branch create or delete flow.

## Acceptance Criteria
- [x] Manager actor: `POST /api/v1/dashboard/branches` returns 403, and no row is created.
- [x] Manager actor: `DELETE /api/v1/dashboard/branches/{siblingOrOwn}` returns 403.
- [x] Manager actor: `PUT /api/v1/dashboard/branches/{sibling}` returns 403; `PUT` on their own branch returns 200.
- [x] Admin actor: `DELETE` on a brand's only branch returns 409, and the branch still exists.
- [x] Admin actor: `DELETE` on one of two branches returns 200 or 204.
- [x] Additions to `tests/Feature/Dashboard/BranchApiTest.php` cover each case, including future bookings and final active branch deactivation.
- [x] The manager portal has no route `/manager/branches/create`; the list and API expose only the assigned branch and hide create/delete actions.
- [x] Backend Pest suite (642 tests) and dashboard `npm run test` (182 tests) pass; targeted PHPStan and Pint checks are clean for touched files.

## Out of Scope
- The Brand Owner role and its branch management: Task 38.
- Auto-creating the first branch on brand creation: Task 49.
