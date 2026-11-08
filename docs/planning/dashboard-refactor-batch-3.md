---
nodeid: docs.planning.dashboard-refactor-batch-3
parentnode: docs.graph
childnodes: []
codeanchors:
  - frontend/web/dashboard/src/
  - frontend/web/dashboard/tests/
---

# Dashboard Refactor: Batch 3

Batch 3 continues the dashboard DRY/SOLID refactor. Batch 1 and Batch 2 built the shared
primitives listed in the task executor's
[dashboard-shared-primitives.md](../../.claude/skills/monorepo-task-executor/references/dashboard-shared-primitives.md).
Batch 3 moves the code that still sits outside them onto them, and adds a primitive only where
the same shape repeats.

## Rules for every step

- One step per local commit. Each step is scanned, planned, implemented and passes every gate
  before the next one starts: lint, typecheck, Vitest, build, and Playwright on a production
  build with `TZ=UTC`. Then hygiene cleanup, then the commit.
- No behaviour change. Status codes, toast copy, cache invalidation, URL output and page
  resets stay the same, proved by the existing tests plus new equivalence tests.
- A new primitive gets a row in `dashboard-shared-primitives.md` and in `src/README.md` in the
  same commit.
- A pre-existing failure found along the way is reported, not fixed in the step.

## Steps

| Step | Scope | Status |
| --- | --- | --- |
| 1 | HTTP status unification | Done |
| 2 | Shared mutation feedback for the remaining mutation hooks | Planned |
| 3 | Remaining URL filter alignment | Planned |

### Step 1: HTTP status unification

Every HTTP status in dashboard code comes from `HttpStatus` (`src/enums/http-status.enum.ts`).
No file redeclares `HTTP_*` constants or writes a bare status number.

- `HttpStatus` gains `MethodNotAllowed` (405), `PayloadTooLarge` (413), `TooManyRequests` (429),
  `InternalServerError` (500), `BadGateway` (502) and `ServiceUnavailable` (503). The existing
  members keep their names and values.
- Migrated files: `hooks/use-update-booking-status.ts`, `services/api/proxy/forward.ts`,
  `services/api/auth/failure-map.util.ts`, `app/api/auth/{login,refresh,me}/route.ts`, and the
  bare `404` in `proxy.ts`.
- Out of scope: the "404" text shown on the not-found screen, which is copy, not a status;
  comments that mention status numbers.
- Acceptance: a repo-wide search finds no `HTTP_*` status constant outside the enum, and an
  enum test pins every value.

### Step 2: Shared mutation feedback

Ten hooks still call `useMutation` directly: assign subscription, create service category,
create walk-in, generate payouts, reschedule booking, save opening hours, save platform
settings, transition payout, update booking status and update subscription status. Four of them
repeat one shape: a success toast, an error toast chosen from the failure status, then
invalidating one or more key roots.

- Scan all ten and record which share that shape. Extract a primitive (for example
  `useFeedbackMutation({ mutationFn, invalidate, success, failure })`), with its callbacks in a
  `lib/*.util.ts` tested through a real `QueryClient` and `MutationObserver`, only if at least
  two hooks fit without special cases.
- Hooks with their own flow (form error mapping, a 409 confirm, optimistic updates) keep it, or
  move to an existing primitive (`useSaveMutation`, `mapApiFormError`) if one already fits.
- Hook signatures and the fields callers read stay unchanged.

### Step 3: Remaining URL filter alignment

`hooks/use-earnings-range.ts` and `hooks/use-service-search.ts` still call `useSearchParams` and
`router.replace` by hand. Neither state has a page number, while `useUrlFilters` requires
`page`.

- Decide between an optional, backward-compatible `useUrlFilters` mode for state without a page
  (or a small `useUrlState` that `useUrlFilters` builds on) and documenting both hooks as
  justified exceptions. Record the choice here before implementing.
- `hooks/use-url-page.ts` is in scope for the same review.
- Acceptance: the URL each hook writes is unchanged, covered by Playwright for earnings and
  services.

## Not in Batch 3

- The earnings and analytics card skeletons (`LoadingSkeleton`, `AnalyticsSkeleton`). They are
  screen-specific layouts, not repeated rows.
- Backend and mobile code. Batch 3 changes no API contract.
