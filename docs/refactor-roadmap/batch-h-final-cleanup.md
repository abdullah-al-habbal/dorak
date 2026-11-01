# Batch H: Final cleanup, deferred items and mobile core sync

Status: [x] Done (single commit)

## Tasks
- [x] Mobile core: the 12 files left uncommitted in `packages/core` (slot DTO, endpoint tables, repositories, four tests) were reviewed. Each is `dart format` output only (identical to HEAD ignoring whitespace and trailing commas), so they are committed as-is.
- [x] Deferred: `BranchDto` and `BranchDetailDto` `latitude` / `longitude` are now `double?`, matching the nullable `branches.latitude` / `longitude` columns. No app code read them from a branch, so no consumer changed.
- [x] Deferred: weekdays stay integers 0 (Sunday) to 6 (Saturday), matching Carbon's `dayOfWeek`. `Core\Constants\WeekdayConstants` is now the single backend definition of that range and the rule `between:0,6`, used by `OpeningHoursRules` and `UpdateScheduleRequest`. A PHP enum is deliberately not used: the value is a calendar index, not a categorical field, and the wire format is unchanged.
- [x] Roadmap index: batches A to H are Done and the deferred list is empty.

## Notes
- Tests: `tests/Unit/Core/WeekdayConstantsTest.php`, mobile `packages/core/test/branch_hours_dto_test.dart`.
- Dashboard needed no change: `BRANCH_WEEKDAYS` is already `[0..6]` and the dashboard has no branch coordinate fields typed as required.
