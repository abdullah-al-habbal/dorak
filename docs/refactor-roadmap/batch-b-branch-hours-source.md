# Batch B: BranchHoursSource enum

Status: [x] Done

Replace the raw `'weekly'` / `'override'` strings of `today_hours.source`.

## Tasks
- [x] Backend: `Modules\Branch\Enums\BranchHoursSource` (`weekly`, `override`).
- [x] Backend: `BranchHours::forDate()` returns the enum; tests assert enum values.
- [x] Mobile: `BranchHoursSource` Dart enum, `BranchHoursDto.source` typed, tests updated.
- [x] Dashboard: checked, no consumer of `today_hours` / `source` exists, so no change.

## Acceptance criteria
- Serialized JSON is unchanged (`"weekly"` / `"override"`); no breaking change, no data migration.
- No raw `'weekly'` / `'override'` literals remain in Branch backend code.
- Unknown values parse to `null` in the mobile DTO instead of crashing.
- Backend, dashboard and mobile gates pass (see index).
