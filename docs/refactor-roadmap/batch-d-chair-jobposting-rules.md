# Batch D: Chair and JobPosting raw `in:` rules

Status: [ ] Todo (one commit per module)

## Tasks
- [ ] Chair: replace `in:available,occupied,maintenance` in `ToggleChairStatusAction` with `Rule::enum(ChairStatus::class)`, move validation into a FormRequest if the guide requires it.
- [ ] JobPosting: replace `in:open,closed,archived` in `UpdateJobPostingRequest` with `Rule::enum(JobPostingStatusEnum::class)`.
- [ ] Confirm the dashboard and mobile enums match the backend cases.

## Acceptance criteria
- No raw `in:` status lists remain in the touched modules.
- Accepted and rejected values are unchanged; add a test per rule for an invalid value.
- Backend gates pass; frontend gates run if any frontend file changes.
