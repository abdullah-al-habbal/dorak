# Batch D: Chair and JobPosting raw `in:` rules

Status: [x] Done (single commit)

## Tasks
- [x] Chair: replace `in:available,occupied,maintenance` in `ToggleChairStatusAction` with `Rule::enum(ChairStatus::class)`, move validation into a FormRequest if the guide requires it.
- [x] JobPosting: replace `in:open,closed,archived` in `UpdateJobPostingRequest` with `Rule::enum(JobPostingStatusEnum::class)`.
- [x] Confirm the dashboard and mobile enums match the backend cases.

## Acceptance criteria
- No raw `in:` status lists remain in the touched modules.
- Accepted and rejected values are unchanged; add a test per rule for an invalid value.
- Backend gates pass; frontend gates run if any frontend file changes.

## Notes
- New `ToggleChairStatusRequest` (Branch module) replaces inline `$request->validate()` with `Rule::enum(ChairStatus::class)`. Validation now runs before the branch ownership lookup, so an invalid payload returns 422 before a 404 for a foreign chair.
- `UpdateJobPostingRequest` validates `status` and `type`, and `StoreJobPostingRequest` validates `type`, with `Rule::enum`. `type` was an unchecked string although the model casts it to `JobPostingTypeEnum`, so an invalid value would have thrown on save.
- `ListChairsRequest` and the barber `ListApplicationsRequest` now validate their `status` filters with enums; unknown filter values return 422 instead of an empty list.
- Models already cast `status` / `type`; `ListJobPostingsEloquentResolver` already used the enum case; no raw literals were left in the Chair or JobPosting Filament screens. Dashboard (`JOB_POSTING_STATUSES`) and mobile already match the backend values and never send `type`.
- Tests: `tests/Feature/Branch/EnumValidationRulesTest.php`.
