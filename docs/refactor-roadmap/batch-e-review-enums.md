# Batch E: Review module cross-layer enums

Status: [x] Done (single commit)

## Tasks
- [x] Backend: replace the raw `in:published,hidden` in `ResolveReviewDisputeRequest` with `Rule::enum(ReviewStatus::class)->only(ReviewStatus::resolutionOutcomes())`; `ListAdminReviewsRequest` uses `Rule::enum`.
- [x] Backend: migration default uses `ReviewStatus::Published->value` instead of a literal.
- [x] Backend: tests use `ReviewSubjectTypeEnum` / `ReviewAuthorTypeEnum` cases instead of `'client'`, `'barber'`, `'branch'` literals.
- [x] Dashboard: `REVIEW_STATUSES`, `REVIEW_SUBJECT_TYPES`, `REVIEW_RESOLUTION_OUTCOMES` defined once (`review.constant.ts`); Zod schemas use `z.enum`; mappers map unknown wire values to `null`; the resolve dialog no longer hardcodes `"published"`.
- [x] Mobile: new `ReviewSubjectType` enum; `ReviewDto.subjectType` and `status` decode with `unknownEnumValue: nullForUndefinedEnumValue`, so an unknown value no longer throws.
- [x] Tests for each layer.

## Audit findings (no change needed)
- Models already cast `status`, `author_type`, `subject_type`; factories, seeders, resources, handlers and the release command already use enum cases.
- The `reviews` table has no boolean columns, so there is nothing to rename to `is_` / `has_`.
- The `Resolved` case is not set by any current flow; it is kept because rating aggregates count it and the wire contract includes it.

## Notes
- Wire values are unchanged. Resolving to `disputed`, `resolved` or an unknown value still returns 422 (now covered by a dataset test); an unknown `status` filter on the admin list returns 422.
- Tests: `tests/Feature/Review/ReviewDisputeTest.php`, dashboard `tests/services/api/dashboard/review/review-enum.util.test.ts`, mobile `packages/core/test/review_repository_test.dart`.
- Gates: `migrate:fresh --seed` ok; `pint --test` passed; `composer test` 1317 passed; dashboard lint, 501 tests, build, tsc clean; `melos run verify` exit 0.
