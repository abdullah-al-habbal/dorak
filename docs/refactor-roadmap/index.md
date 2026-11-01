# Refactor Roadmap: Naming and Enum Hygiene

Cross-layer consistency work (DB, Laravel, API, dashboard, mobile, tests, docs),
delivered as small, independently reviewable batches. Each batch has its own
story file with acceptance criteria and a status checkbox.

Rules for every batch: one domain per commit, serialized values stay
backward-compatible, all consumers change in the same commit, and the checks
listed in the story pass before the local commit. Never push.

| Batch | Story | Scope | Status |
| --- | --- | --- | --- |
| A | Branch enum and schema hygiene (commit `4bda6261`) | Branch backend | Done |
| B | [Branch hours source](batch-b-branch-hours-source.md) | Backend + mobile (+ dashboard check) | Done |
| C | [Dashboard and mobile enums](batch-c-dashboard-mobile-enums.md) | Branch status/universe literals | Todo |
| D | [Chair and JobPosting rules](batch-d-chair-jobposting-rules.md) | Raw `in:` validation rules | Todo |

## Deferred (needs a decision)

- `branch_opening_hours.weekday` int enum: low value, kept as an integer 0 to 6.
- Mobile `BranchDto.latitude` / `longitude` are non-null but the DB columns are
  nullable. Decide: make the DTO nullable or enforce non-null coordinates.

## Verification commands (real scripts)

- Backend (`backend/`): `php artisan migrate:fresh --seed`, `vendor/bin/pint --test`, `composer test`.
- Dashboard (`frontend/dashboard/`, no root workspace): `npm run lint`, `npm run test`, `npm run build`.
- Mobile (`frontend/mobile/`): `dart run melos run verify`.
