# 02 — Components and Hooks

**Inspected:** responsibility boundaries, file size, nesting, business logic in JSX, hooks.
**Verdict:** no God Component or God Hook. The largest component (excluding `ui/`) is 185 lines; the largest hook is 89 lines (`use-floor-plan-editor.ts`), which is cohesive and justified (one editor's state).

---

## F-01 — Two parallel form styles

- **Category:** Mixed Responsibilities / Inconsistent Coding Patterns
- **Risk:** 6/10 · **Priority:** P1
- **Scope:** repeated (~11 multi-field dialogs out of 21 files that use `FormEvent` without `useForm`)

**Files (confirmed examples):**
- `src/components/website-content/testimonial-dialog.tsx:32-41` (9 `useState`), `:43-72` (validation + payload building + error handling inside the component)
- `src/components/website-content/content-section-dialog.tsx` (8 `useState`)
- `src/components/catalog-items/catalog-item-form-dialog.tsx:46-100` (8 `useState`; `submit` validates and builds the payload)
- `commission-rule-form-dialog.tsx:70-82`, `payment-gateway-form-dialog.tsx:56-89`, `job-posting-form-dialog.tsx:54`, `currency-form-dialog.tsx:35-46`, `exchange-rate-dialog.tsx:35-50`, `assign-subscription-dialog.tsx:41-51`
- By contrast, 22 files use `useForm` + `zodResolver` (for example `service-form-dialog.tsx:41-65`).

**What is wrong:** about half of the multi-field forms bypass the sanctioned stack (RHF + Zod schemas + `schemas/fields/` + `mapApiFormError`) that `AGENTS.md` makes mandatory. Validation is manual (`Number(sort)`, `!x.trim()`) inside `submit`, and errors show as one banner message instead of per-field errors.

**Why it matters / actual impact:**
- A 422 from the backend collapses to one generic message in 7 places with identical code: `failure instanceof ApiClientError && failure.status === HttpStatus.Unprocessable ? … : …`. The user cannot tell which field is wrong, although the backend returns `fields` (`client.ts:43`).
- Validation and payload mapping cannot be tested without rendering the whole dialog (see F-11).
- New dialogs get copied from the nearest one, so the drift spreads (it did with the recent FT-9..FT-12 features).
- Not a behavioral bug today; it is maintenance debt that grows.

**Recommended correction (proportionate):**
1. No mass migration. Single-field reason dialogs (`account-ban-dialog`, `barber-reject-dialog`, …) are **fine as they are**.
2. For multi-field dialogs, move validation into a Zod schema using `schemas/fields/` and adopt `useForm` + `mapApiFormError` when the file is next touched.
3. Any new dialog must use RHF+Zod.
4. Good first candidates: `testimonial-dialog`, `content-section-dialog`, `content-page-dialog` (they also share the en/ar pair problem, F-06).

**Depends on / blocks:** pairs with F-06 (shared bilingual field helper) and F-11 (testability).

---

## F-07 — Duplicated debounced-search logic

- **Category:** Duplicated Logic
- **Risk:** 3/10 · **Priority:** P2 · **Scope:** two places

**Files:** `src/components/common/search-input.tsx:20-35` and `src/components/bookings/booking-toolbar.tsx:41-53`.

**What is wrong:** an identical block: `useState(search)` + a `seen` value to adopt external changes during render + a `useEffect` timer using `SEARCH_DEBOUNCE_MS`. The "adjust state during render" pattern itself is correct (documented by React); the problem is the copy.

**Impact:** any fix to the debounce (IME composition, RTL, cancellation) has to be applied twice. `SearchInput` also needs a stable `onCommit` identity or the timer restarts on each render; that requirement is documented only in `src/README.md`.

**Correction:** render `SearchInput` inside `BookingToolbar`, or extract the shared part into a `useDebouncedSearch` hook. Small change.

---

## Correct as-is

- **Composition:** `OverlayHost` + `OverlayKind` is a single mount point for dialogs (`overlay-host.tsx:52-143`) with an exhaustive switch. It is a useful abstraction, not a pointless layer. (Performance note in F-03.)
- **Shared hooks:** `useListQuery`, `useSaveMutation`, `useFeedbackMutation`, `useUrlFilters` and others are a small, genuinely reused layer (59 `invalidate` call sites).
- **`useFloorPlanEditor`** (`hooks/chairs/use-floor-plan-editor.ts`): `dirty` is derived via `isDirty`, not stored; state is reset with a `key` after save. Sound design.
- **Nesting:** no excessive nesting, no components created inside render.
