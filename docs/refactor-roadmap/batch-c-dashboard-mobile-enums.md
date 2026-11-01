# Batch C: Dashboard and mobile enums for Branch status and universe

Status: [x] Done

## Tasks
- [x] Dashboard: define the branch status list (`pending`, `enabled`, `disabled`) once and reuse it in `BranchSchema`, the second schema at `dashboard-entities.schema.ts:64` and `branch-form.schema.ts`.
- [x] Dashboard: define the universe list (`men`, `women`, `unisex`) once and reuse it.
- [x] Mobile: `BranchStatus` and `VenueUniverse` Dart enums; type `status` / `universe` in `BranchDto` and `BranchDetailDto`; run codegen.
- [x] Update dashboard and mobile tests.

## Acceptance criteria
- Wire values unchanged; no backend change expected.
- No duplicated status/universe literal lists remain in the dashboard.
- `flutter analyze` and `melos run verify` pass; dashboard lint, test and build pass.
- Open item (still deferred): decide nullable coordinates in `BranchDto` (see index, Deferred).

## Notes
- Dashboard constants: `BRANCH_STATUSES` (`branch/branch.constant.ts`) and `VENUE_UNIVERSES` (`shared/venue-universe.constant.ts`); `BRAND_UNIVERSES` now aliases `VENUE_UNIVERSES`.
- Stylist status (`StylistSchema`, stylist form) uses the same literals but is a Barber-module status; left for a Barber batch.
- Dart enums `BranchStatus` and `VenueUniverse` mirror the PHP enums. Unknown status falls back to `pending`; unknown universe parses to `null`.
- Two test fixtures used invalid statuses (`'active'`, `'approved'`); they now use `BranchStatus.enabled`.
