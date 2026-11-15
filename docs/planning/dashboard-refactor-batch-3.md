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
| 2 | Shared mutation feedback for the remaining mutation hooks | Done |
| 3 | Shared list query for the paginated list hooks | Done |
| 3a | `useDeleteMutation` and `useSaveMutation` built on `useFeedbackMutation` | Done |
| 3b | Service category field error mapping through `mapApiFormError` | Done |
| 3c | Plan options read through `useReferenceQuery` | Done |
| 4 | Remaining URL filter alignment | Done |

### Step 1: HTTP status unification

Every HTTP status in dashboard code comes from `HttpStatus` (`src/enums/http-status.enum.ts`).
No file redeclares `HTTP_*` constants or writes a bare status number.

- `HttpStatus` gains `MethodNotAllowed` (405), `PayloadTooLarge` (413), `TooManyRequests` (429),
  `InternalServerError` (500), `BadGateway` (502) and `ServiceUnavailable` (503). The existing
  members keep their names and values.
- Migrated files: `hooks/bookings/use-update-booking-status.ts`, `services/api/proxy/forward.ts`,
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

Outcome: `useFeedbackMutation({ mutationFn, invalidate, successMessage, errorMessage? })`
(`hooks/core/use-feedback-mutation.ts`, callbacks in `lib/feedback-mutation.util.ts`) now backs
eight of the ten hooks. The booking status 409/400 copy moved to `bookingStatusErrorMessage`.
Create service category (no toast, invalidates on success only) and save opening hours
(`setQueryData`, no invalidation) keep `useMutation`, because the primitive would change their
behaviour.

### Step 3: Shared list query

Eleven list hooks repeated `useQuery({ queryKey: xKeys.list(...), queryFn, placeholderData:
keepPreviousData })`. `useListQuery(queryKey, queryFn, enabled?)` (`hooks/core/use-list-query.ts`,
options in `lib/list-query.util.ts`) now backs branches, stylists, chairs, services, plans,
reviews, payouts, admin payouts, admin subscriptions, schedule appointments and bookings.
Reads that must not show the previous record (booking history, opening hours), that have their
own cache rule (branch detail, `gcTime: 0`) or that are already a bare `useQuery({ queryKey,
queryFn })` (earnings, analytics, platform settings, schedule hours, subscriptions) stay on
`useQuery`.

### Step 3a to 3c: Follow-ups

- **3a.** `useDeleteMutation` and `useSaveMutation` build their options through
  `deleteFeedbackOptions` and `saveFeedbackOptions` on top of `useFeedbackMutation`, so the
  toast and invalidate-on-settle code lives once. Signatures, toasts and keys are unchanged.
- **3b.** `components/services/service-category-field.tsx` and
  `components/working-hours/working-hours-editor.tsx` both walked `mapApiFieldErrors` output by
  hand for one message. Both now call `formErrorMessage(error, generic)`
  (`lib/map-api-form-error.util.ts`), built on `mapApiFormError`, with the same message shown.
- **3c.** `usePlanOptions` moves to `useReferenceQuery`. This is the one intended behaviour
  change in Batch 3: the active-plan options are cached for `STALE_TIME.Reference` instead of
  refetched every time the assign dialog opens. Approved by the user. Saving or deleting a plan
  still invalidates `planKeys.all`, so a new or activated plan shows on the next open; Playwright
  (`admin-subscriptions.spec.ts`) counts the option requests to pin both behaviours.

### Step 4: Remaining URL filter alignment

`hooks/earnings/use-earnings-range.ts` and `hooks/use-service-search.ts` still call `useSearchParams` and
`router.replace` by hand. Neither state has a page number, while `useUrlFilters` requires
`page`.

- Decide between an optional, backward-compatible `useUrlFilters` mode for state without a page
  (or a small `useUrlState` that `useUrlFilters` builds on) and documenting both hooks as
  justified exceptions. Record the choice here before implementing.
- `hooks/use-url-page.ts` is in scope for the same review.
- Acceptance: the URL each hook writes is unchanged, covered by Playwright for earnings and
  services.

#### Decision (feasibility assessment, 2026-11-08): proceed with a page-agnostic base

The assessment approved the work with conditions; no blocking issue was raised. The request offered (a) an
optional no-page mode in `useUrlFilters` and (b) documenting the hooks as exceptions. The assessment
chose the `useUrlState` base named above, which this doc already allowed as the alternative to (a):

- (a) is rejected: a flag or a looser `F` puts a conditional page rule, and a type hole, into a
  primitive with nine callers (booking, branch, chair, stylist, review, plan, payout, schedule,
  admin subscription), and it does nothing for the shared write.
- (b) is rejected: it keeps the same `router.replace` expression in four files, against the
  "hand-written `useSearchParams` + `router.replace`" rule in `dashboard-shared-primitives.md`.

Design, three layers:

- `lib/url-query.util.ts`: `toReplaceHref(pathname, query)` (bare pathname for an empty query)
  and `applyFilterPatch(filters, patch)` (any non-`page` key resets to page 1).
- `hooks/core/use-replace-query.ts`: `useReplaceQuery()` returns a stable writer that calls
  `router.replace(href, { scroll: false })`. It is the only place a query string is written.
- `hooks/core/use-url-state.ts`: `useUrlState(fromParams, toParams)` returns `{ value, setValue }`.
  `setValue` takes a whole value and does not depend on the current value, so `setRange` and
  `setSearch` keep a stable identity (the services `SearchInput` lists `onCommit` as an effect
  dependency, and a changing setter would restart its debounce).
- `useUrlFilters` is `useUrlState` plus `applyFilterPatch`, with the same signature and the same
  `F extends { page: number }` bound. `useEarningsRange` and `useServiceSearch` move onto
  `useUrlState` with stable serialisers (`today` bound with `useCallback`, a module-level
  `searchToParams`). `searchToParams` replaces `searchToQuery`, which had no other caller; its
  Vitest cases pin the exact query strings `searchToQuery` wrote (empty, `search=a+b`, Arabic).

`hooks/use-url-page.ts` is removed. All ten `PaginationBar` callers pass `onPageChange` (their
filter hook's page setter), so the `useUrlPage` fallback never ran. `onPageChange` becomes
required, which the typecheck proves, and the unused `withPage` helper goes with it. No URL a
user can produce changes.

Coverage is written first and run green on the code before the refactor, then rerun unchanged
after it: the services search URL and its bare-path clear, the bare earnings URL on the default
preset, the pagination bar's `page=2` write, and a back-navigation check that the writes replace
history instead of pushing to it.

## Not in Batch 3

- The earnings and analytics card skeletons (`LoadingSkeleton`, `AnalyticsSkeleton`). They are
  screen-specific layouts, not repeated rows.
- Backend and mobile code. Batch 3 changes no API contract.
