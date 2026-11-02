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
| C | [Dashboard and mobile enums](batch-c-dashboard-mobile-enums.md) | Branch status/universe literals | Done |
| D | [Chair and JobPosting rules](batch-d-chair-jobposting-rules.md) | Raw `in:` validation rules | Done |
| E | [Review enums](batch-e-review-enums.md) | Review backend, dashboard, mobile | Done |
| F | [Barber and Client enums](batch-f-barber-client-enums.md) | Barber and Client backend, dashboard, mobile | Done |
| G | [Catalog, Subscription, Payment enums](batch-g-catalog-payment-enums.md) | Payment driver enum; catalog mobile enums | Done |
| H | [Final cleanup](batch-h-final-cleanup.md) | Deferred items, mobile core sync | Done |
| I | [Money and currency](batch-i-money-currency.md) | Currency code FKs, `*_amount_minor`, payout names | Done |
| J1 | [Units, rates, counts](batch-j-units-rates-counts.md) | Radius km, percent/ratio, attempts count | Done |
| J2 | [Ratings, durations, state booleans](batch-j-ratings-durations-booleans.md) | `rating_average`, `duration_minutes`, `allows_*`, `favorited_*` | Done |

## Deferred

None. The weekday and branch coordinate items were resolved in [Batch H](batch-h-final-cleanup.md).

## Verification commands (real scripts)

- Backend (`backend/`): `php artisan migrate:fresh --seed`, `vendor/bin/pint --test`, `composer test`.
- Dashboard (`frontend/dashboard/`, no root workspace): `npm run lint`, `npm run test`, `npm run build`.
- Mobile (`frontend/mobile/`): `dart run melos run verify`.
