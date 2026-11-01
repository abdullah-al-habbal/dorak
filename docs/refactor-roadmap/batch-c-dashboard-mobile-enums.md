# Batch C: Dashboard and mobile enums for Branch status and universe

Status: [ ] Todo

## Tasks
- [ ] Dashboard: define the branch status list (`pending`, `enabled`, `disabled`) once and reuse it in `BranchSchema`, the second schema at `dashboard-entities.schema.ts:64` and `branch-form.schema.ts`.
- [ ] Dashboard: define the universe list (`men`, `women`, `unisex`) once and reuse it.
- [ ] Mobile: `BranchStatus` and `VenueUniverse` Dart enums; type `status` / `universe` in `BranchDto` and `BranchDetailDto`; run codegen.
- [ ] Update dashboard and mobile tests.

## Acceptance criteria
- Wire values unchanged; no backend change expected.
- No duplicated status/universe literal lists remain in the dashboard.
- `flutter analyze` and `melos run verify` pass; dashboard lint, test and build pass.
- Open item: decide nullable coordinates in `BranchDto` (see index, Deferred).
