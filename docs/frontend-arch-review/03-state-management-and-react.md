# 03 — State Management and React Patterns

**Inspected:** all 13 `useEffect` uses, every `useMemo/useCallback` (by count and by sampling), both Zustand stores, the providers.

---

## F-02 — Two sources for the user session

- **Category:** Redundant State / Incorrect State Ownership
- **Risk:** 5/10 · **Priority:** P1 · **Scope:** ≥6 read sites

**Files:**
- `src/components/layout/portal-session.tsx:23-28`: the server passes `session.profile` as a prop to `PortalShell` (→ `Header`) **and** to `SessionHydrator`.
- `src/components/providers/session-hydrator.tsx:17-19`: writes to Zustand inside `useEffect`, i.e. **after** the first render.
- Store readers: `overview/overview-panel.tsx:10`, `services/services-screen.tsx:47`, `reviews/reviews-screen.tsx:39`, `stylists/stylist-form-dialog.tsx:41`, `layout/user-menu.tsx`.

**What is wrong:** the same data (the profile) arrives by two routes: a synchronous prop and an asynchronously filled store. Components reading the store see `profile = null` during SSR and the first client render.

**Actual impact (confirmed from code):**
- `OverviewPanel` emits server HTML with a greeting without a name and the role field as `"-"` (`overview-panel.tsx:11,28`), then changes after hydration (visible flash).
- `ServicesScreen` derives `brandId` from the store; an interaction before the first effect would pass `brandId = null` to the dialog. The window is extremely narrow, so I do not count this as a confirmed bug.
- `src/README.md` itself says layout state needing server seeding belongs in providers.

**Correction:** seed the store synchronously (a provider that creates the store with initial state, or a Context carrying `actor/profile` from `PortalSession`), and keep Zustand only for what changes afterwards (`patchProfile`). Contained change in `session-hydrator.tsx` and `auth.store.ts`.

**Independent** of other findings.

---

## `useEffect` — fully reviewed, no violations

| Location | Purpose | Verdict |
|---|---|---|
| `booking-grid.tsx:49` (`useNow`) | `setInterval` clock | correct (cleanup present) |
| `booking-toolbar.tsx:48`, `search-input.tsx:28` | debounce | correct; duplication is F-07 |
| `service-form-dialog.tsx:54` | set default currency once it arrives | justified and commented; RHF `values` would be an alternative, not required |
| `use-verify-owner-code-form.ts:42` | resend countdown | correct |
| `app-providers.tsx:19,21` | `matchMedia` subscription + theme hydrate | correct |
| `session-hydrator.tsx:17,21` | session + `onSessionExpired` | first one is part of F-02; second is correct |
| `reset-password-screen.tsx:22`, `use-leave-warning.ts:7`, `error.tsx`, `global-error.tsx` | reporting / leave warning | correct |

There is no `useEffect` used to sync derived state, which is the common mistake. The "adjust state during render" pattern in `SearchInput` is correct.

## `useMemo` / `useCallback`

- Only 25 files use them; restrained and consistent with the written rule (React Compiler is not enabled).
- One cosmetically questionable spot: `services-screen.tsx` uses `useMemo(() => query.data ?? [], [query.data])` to keep a stable empty array for `groupByCategory`. Acceptable; not worth changing.
- `working-hours-editor.tsx` (9 uses) is justified by the documented sole `memo` component.
- `OverlayProvider` recreates `close` whenever `request` changes; acceptable since the value changes anyway.

## Global state (Zustand/Context)

- `store/` has only two stores (`auth`, `theme`); no overuse of global state.
- `OverlayContext` is justified because dialogs open from any depth.
- No excessive prop drilling found.

## Many `useState` calls in dialogs

Covered by F-01 (the root cause is the form style, not the hooks). I do not recommend `useReducer`; RHF already exists in the project.
