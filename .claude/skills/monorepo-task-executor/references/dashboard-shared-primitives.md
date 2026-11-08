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
| URL-backed list filters (Batch 1) | `useUrlFilters(fromParams, toParams)` in `hooks/use-url-filters.ts`; a module filter hook only supplies its parse and serialise functions. Any non-`page` patch resets to page 1. | Hand-written `useSearchParams` + `router.replace` filter hooks. |
| Pagination fallback (Batch 1) | `resolvePageInfo` in the query fetcher. | Repeating the `page ?? {...}` fallback per fetcher. |
| Delete flow (Batch 1) | `useDeleteMutation({ remove, invalidate, messages, surfaceConflict? })`; 409 copy through `conflictMessage`. | Per-module `useMutation` with its own toasts and invalidation. |
| Create/update flow (Batch 1) | `useSaveMutation({ create, update, invalidate, messages })` with `SaveVariables<P>` (`id` present means update). | Separate create and update hooks that duplicate toasts and invalidation. |
| Long-lived option lists (Batch 1) | `useReferenceQuery(queryKey, queryFn, staleTime?, enabled?)` with `STALE_TIME` from `config/stale-time.constant.ts`. | Per-hook stale-time constants or literals. |
| HTTP statuses (Batch 1) | `HttpStatus` in `enums/http-status.enum.ts`. | Redeclared status numbers. |
| Query keys (Batch 2, Step 1) | `createQueryKeys(root, { name: [...] \| (args) => [...] })` in `lib/create-query-keys.util.ts`, one `*-keys` module per feature; `queryKey(root, ...segments)` for a single key. `all` is the root, so invalidating `all` reaches every key of the module. | Hand-built `as const` key arrays or a second root for the same module. |
| Form field schemas (Batch 2, Step 2) | `nameField`, `emailField`, `phoneField`, `passwordField` in `schemas/fields/`; limits from `config/field-limit.constant.ts`. | Inline `z.string().trim().min().max()` chains for these fields or limit literals. |
| Form error mapping (Batch 2, Step 3) | `mapApiFormError(error, generic, toFormFieldName?)` in `lib/map-api-form-error.util.ts`, returning `MappedFormError` (`interfaces/mapped-form-error.interface.ts`). A module mapper only adds its `FormFieldNameMapper` and its status-specific cases (for example branch 403/409). | Re-walking `mapApiFieldErrors` output by hand or redeclaring the error shape. |
| Optimistic switch toggles (Batch 2, Step 4) | `useOptimisticToggleMutation({ queryKey, mutationFn, patch, successMessage, failureMessage? })` in `hooks/use-optimistic-toggle-mutation.ts`; callbacks in `lib/optimistic-toggle-mutation.util.ts`. `patch` is a pure `*-cache.util.ts` helper that returns untouched entries as-is. Leave `failureMessage` out only when the caller reports the failure itself (the chair 409 confirm). | Hand-written `onMutate` snapshot, rollback and invalidate code. |
| Skeleton rows (Batch 2, Step 5) | `SkeletonRows({ count, rowClassName? })` (one `role="status"` region labelled `common.loading`) and `SkeletonRow({ className? })` (full width, no shimmer under reduced motion) in `components/ui/skeleton-row.tsx`. `TableSkeleton` wraps it with 60 px rounded rows. | `Array.from(...).map(() => <Skeleton .../>)` loading stacks with their own status wrapper. |
| Bookings query (Batch 2, Step 5) | `useBookingsQuery(filters, weekStart)` in `hooks/use-bookings-query.ts`: key `bookingKeys.list(filters)`, `keepPreviousData`, fetch by `fetchBookingsForView` (list view reads one page; day/week read the window as one page through `resolvePageInfo`). | An inline `useQuery` for bookings in a screen, or a hand-built single-page block. |

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
