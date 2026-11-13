# Coverage matrix

One matrix per feature or workflow. Keep it next to the work (the task's report, or the "Tests" line of
its doc section); it is not a separate file to maintain for every route. Its job is to expose gaps
without writing duplicate tests.

## The 12 columns

| # | Column | What goes in it |
| --- | --- | --- |
| 1 | Feature / workflow | Route or journey, for example `POST /dashboard/brands` |
| 2 | Business rules | The rule ids or one-line rules the code enforces |
| 3 | Actors and permissions | Per actor the status the code returns, or `undefined` (never guessed) |
| 4 | Tenant boundaries | The tenant keys involved (`brand_id`, `branch_id`, `owner_id`) and what must not leak |
| 5 | Positive scenarios | Allowed behaviour tested |
| 6 | Negative scenarios | Validation, forbidden transitions, 401/403/404/422 |
| 7 | Failure scenarios | External, database, mail, concurrency, rollback; or `n/a` with a reason |
| 8 | Persistence and side effects | Rows written or untouched, queued mail, notifications, audit |
| 9 | Existing tests | File and test name for each covered cell |
| 10 | Missing coverage | Specific scenarios still to write |
| 11 | Risk level | `high` (security, tenant, money, lifecycle), `medium`, `low` |
| 12 | Verification status | One of the statuses below |

## Verification statuses

| Status | Meaning |
| --- | --- |
| `missing` | No test proves it |
| `written` | Test exists, not yet run in this task |
| `passing` | Test ran and passed; effectiveness not yet reviewed |
| `reviewed` | Passing and checked with the effectiveness review |
| `mutation-checked` | A mutation tool or a manual break proved the test can fail |
| `unverified` | The behaviour cannot be proved with the tools here (for example real concurrency) |
| `n/a` | Does not apply; the reason is written in the cell |

## Template

```markdown
| Feature | Rules | Actors | Tenant | Positive | Negative | Failure | Side effects | Existing | Missing | Risk | Status |
| --- | --- | --- | --- | --- | --- | --- | --- | --- | --- | --- | --- |
| POST /dashboard/brands | new brand is pending; owner only | owner 201; admin 403; manager 403; barber 403; guest 401 | brand.owner_id is the caller | create + first branch | validation, 401/403 | n/a: single transaction | brand row, branch row | DashboardOwnerBrandsTest | submission mail not asserted | high | reviewed |
```

## How to fill it without inventing

1. Start from the routes and policies, not from the tests, so a missing test shows as an empty cell.
2. For every existing test, cite it in column 9 instead of adding another.
3. Mark a cell `n/a` only with a reason a reviewer can check.
4. When the code returns different statuses for the same kind of denial, record both and flag it.
5. Do not mark `reviewed` until you asked, for that test, whether it would fail on the regression it targets.

## Reporting from the matrix

Summarise counts per status, list every `high` row that is not `reviewed`, and list every
`unverified` row with the reason. A matrix with all rows `passing` is not "fully covered".
