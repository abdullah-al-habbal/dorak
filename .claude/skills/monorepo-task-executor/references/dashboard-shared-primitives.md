---
nodeid: skills.repo.monorepo-task-executor.references.dashboard-shared-primitives
parentnode: skills.repo.monorepo-task-executor
childnodes: []
codeanchors:
  - frontend/web/dashboard/src/
  - frontend/web/dashboard/tests/
---

# Dashboard shared primitives (mandatory reuse)

The DRY/SOLID refactor batches extracted these primitives from copied code. They are
**binding rules for every dashboard change**: a new feature, a fix, a hotfix, a bug fix, a
refactor or a review. Paths are under `frontend/web/dashboard/src/`.

## The rule

1. Before writing a hook, key module, schema field, error mapper or mutation, check the table
   below. If a primitive covers the case, use it. Do not copy its body inline or write a
   parallel version.
2. If it almost fits, extend the primitive with an optional, backward-compatible option and a
   test. Do not fork it. Every existing caller must keep its behaviour.
3. If nothing fits and the same shape now exists twice, extract a new primitive: equivalence
   tests against the code it replaces, an entry in `src/README.md`, and a row in this file.
4. In a review, flag any new code that re-implements a primitive as a finding.

## Primitives

| Concern | Use | Never |
| --- | --- | --- |
| URL-backed list filters (Batch 1) | `useUrlFilters(fromParams, toParams)` in `hooks/core/use-url-filters.ts`, built on `useUrlState`; a module filter hook only supplies its parse and serialise functions; bind extra arguments (the bookings `today`) with `useCallback` so they stay stable. Any non-`page` patch resets to page 1 (`applyFilterPatch`, `lib/core/url-query.util.ts`). Pagination bars take the hook's page setter as the required `onPageChange`. | Hand-written `useSearchParams` + `router.replace` filter hooks. |
| URL-backed state without a page (Batch 3, Step 4) | `useUrlState(fromParams, toParams)` in `hooks/core/use-url-state.ts` returns `{ value, setValue }`; `setValue` takes a whole value and keeps its identity while the serialiser is stable (module function, or `useCallback`). Used by `useEarningsRange`, `useServiceSearch` and `useUrlFilters`. | A per-screen `useSearchParams` read and `router.replace` write; a mode flag on `useUrlFilters`. |
| Query string writes (Batch 3, Step 4) | `useReplaceQuery()` in `hooks/core/use-replace-query.ts`: the only `router.replace` of a query string (`toReplaceHref`, bare pathname when empty, `{ scroll: false }`, replace not push). | `router.replace(query ? ... : pathname, ...)` written inline. |
| Function identity (`useCallback`) | Only for props of a `memo` component (`WorkingHoursDayRow`, the only one; its props must keep their identity, so days without problems get the shared `NO_ISSUES` array from `groupIssuesByDay`, never a fresh `filter` result) and for functions a hook needs stable: the `useUrlState` serialisers, `useReplaceQuery`, and the `update` setters of `useUrlFilters` and `useAdminCatalogFilters` (consumers list them as effect dependencies). | `useCallback` around handlers passed to ordinary components or DOM elements; a `useMemo` kept only to stabilise such a handler. |
| Pagination fallback (Batch 1) | `resolvePageInfo` in the query fetcher. | Repeating the `page ?? {...}` fallback per fetcher. |
| Delete flow (Batch 1) | `useDeleteMutation({ remove, invalidate, messages, surfaceConflict? })`; 409 copy through `conflictMessage`. Built on `useFeedbackMutation` through `deleteFeedbackOptions` (`lib/core/delete-mutation.util.ts`). | Per-module `useMutation` with its own toasts and invalidation. |
| Create/update flow (Batch 1) | `useSaveMutation({ create, update, invalidate, messages })` with `SaveVariables<P>` (`id` present means update). Built on `useFeedbackMutation` through `saveFeedbackOptions` (`lib/core/save-mutation.util.ts`). | Separate create and update hooks that duplicate toasts and invalidation. |
| Long-lived option lists (Batch 1) | `useReferenceQuery(queryKey, queryFn, staleTime?, enabled?)` with `STALE_TIME` from `config/stale-time.constant.ts`. Dialog option lists such as the assign dialog's active plans (`usePlanOptions`) use it too; the owning module's save and delete hooks invalidate its root, so cached options never hide a saved change. | Per-hook stale-time constants or literals. |
| HTTP statuses (Batch 1) | `HttpStatus` in `enums/http-status.enum.ts`. | Redeclared status numbers. |
| Query keys (Batch 2, Step 1) | `createQueryKeys(root, { name: [...] \| (args) => [...] })` in `lib/core/create-query-keys.util.ts`, one `*-keys` module per feature; `queryKey(root, ...segments)` for a single key. `all` is the root, so invalidating `all` reaches every key of the module. | Hand-built `as const` key arrays or a second root for the same module. |
| Form field schemas (Batch 2, Step 2) | `nameField`, `emailField`, `phoneField`, `passwordField` in `schemas/fields/`; limits from `config/field-limit.constant.ts`. | Inline `z.string().trim().min().max()` chains for these fields or limit literals. |
| Form error mapping (Batch 2, Step 3) | `mapApiFormError(error, generic, toFormFieldName?)` in `lib/core/map-api-form-error.util.ts`, returning `MappedFormError` (`interfaces/core/mapped-form-error.interface.ts`). A module mapper only adds its `FormFieldNameMapper` and its status-specific cases (for example branch 403/409). A form with one message slot (inline category form, working-hours banner) uses `formErrorMessage(error, generic)` from the same file: the first field error, else the form-level message. | Re-walking `mapApiFieldErrors` output by hand or redeclaring the error shape. |
| Optional translation pairs | `optionalTranslationSchema` in `schemas/core/optional-translation.zod.ts` reads a nullable `{en?, ar?}` (or the `[]` Laravel sends for an empty translation set) as `{en, ar} | null`. Used by admin brands and the admin catalog. | Another inline copy of the same preprocess. |
| Optimistic switch toggles (Batch 2, Step 4) | `useOptimisticToggleMutation({ queryKey, mutationFn, patch, successMessage, failureMessage? })` in `hooks/core/use-optimistic-toggle-mutation.ts`; callbacks in `lib/core/optimistic-toggle-mutation.util.ts`. `patch` is a pure `*-cache.util.ts` helper that returns untouched entries as-is. Leave `failureMessage` out only when the caller reports the failure itself (the chair 409 confirm). Pass `invalidate: [otherKeys.root]` to also refresh caches the toggle affects but must not patch (the admin catalog refreshes the service form's category picker). | Hand-written `onMutate` snapshot, rollback and invalidate code. |
| Toast-and-refresh writes (Batch 3, Step 2) | `useFeedbackMutation({ mutationFn, invalidate, successMessage, errorMessage? })` in `hooks/core/use-feedback-mutation.ts`, callbacks in `lib/core/feedback-mutation.util.ts`. `successMessage(data, variables)`; leave `errorMessage` out when the form shows the failure inline. Status-specific copy goes in a `lib/*-error.util.ts` (`bookingStatusErrorMessage`) or `conflictMessage`. Not for optimistic toggles, `setQueryData` writes or delete/save flows, which have their own primitives. | Per-hook `useMutation` with hand-written `toast.success`/`toast.error` and `invalidateQueries` callbacks. |
| Skeleton rows (Batch 2, Step 5) | `SkeletonRows({ count, rowClassName?, className? })` (one `role="status"` region labelled `common.loading`; `className` adjusts the stack, such as `gap-3` in form dialogs) and `SkeletonRow({ className? })` (full width, no shimmer under reduced motion) in `components/ui/skeleton-row.tsx`. `TableSkeleton` wraps it with 60 px rounded rows; the plan, branch and assign-subscription dialogs use it with `h-10` rows. | `Array.from(...).map(() => <Skeleton .../>)` loading stacks with their own status wrapper. |
| Paged and filtered lists (Batch 3, Step 3) | `useListQuery(queryKey, queryFn, enabled?)` in `hooks/core/use-list-query.ts`, options in `lib/core/list-query.util.ts`: `placeholderData: keepPreviousData`, `enabled` defaults to `true`. A module list hook only supplies its `xKeys.list(...)` key and fetcher. Long-lived option lists use `useReferenceQuery` instead; reads with other cache rules (`useAdminBrand`'s `placeholderData`) stay on `useQuery`; a read of one record by id uses `useDetailQuery`. | `useQuery({ ..., placeholderData: keepPreviousData })` in a list hook. |
| One record by id (Batch 4) | `useDetailQuery(id, keyFor, fetcher, extras?)` in `hooks/core/use-detail-query.ts`, options in `lib/core/detail-query.util.ts`: `id` of `null` or `undefined` makes the `queryFn` TanStack's `skipToken` (nothing is requested, the query stays idle), otherwise it fetches `fetcher(id)`. The key is `keyFor(id ?? "")`; `extras.gcTime` sets the cache lifetime (`useBranchDetail` uses `0`). Used by `useBookingHistory`, `useOpeningHours` and `useBranchDetail`. `refetch()` throws on a `skipToken` query, so call it only from an error state, which needs an id. | `enabled: id !== null` together with `id ?? ""` in the fetcher. |
| Bookings query (Batch 2, Step 5) | `useBookingsQuery(filters, weekStart)` in `hooks/bookings/use-bookings-query.ts`: key `bookingKeys.list(filters)`, `useListQuery` (keeps the previous data), fetch by `fetchBookingsForView` (list view reads one page; day/week read the window as one page through `resolvePageInfo`). | An inline `useQuery` for bookings in a screen, or a hand-built single-page block. |

## Behaviour that must not change when migrating onto a primitive

- Key structures and export names (`xKeys.all`, `xKeys.list(filters)`) stay identical; prove it
  with an equivalence test.
- Zod output, accepted values and error messages stay identical; prove it with equivalence tests
  against the inline rules that are replaced.
- Field-error keys and form-level messages stay identical.
- Optimistic order stays: cancel, snapshot every entry under the root, patch, restore every
  snapshot on error, toast, invalidate the root on settle. Hook signatures, variables and the
  `isPending`/`variables` fields that callers read (`togglingId`) stay the same.

## Testing primitives

Vitest runs in Node without jsdom, so keep a primitive's logic in a `lib/*.util.ts` that the
hook wraps, and test the util directly. For TanStack mutation options, drive them through a real
`QueryClient` and `MutationObserver` (the same path `useMutation` takes), with `vi.mock("sonner")`.
Cover user-visible behaviour in a Playwright spec for at least one caller per module.
