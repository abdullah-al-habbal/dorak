# 01 — Executive Summary

## Scope

- **Project:** `frontend/web/dashboard/` (Next.js 16.4, React 19.3, TypeScript, TanStack Query 5, Zustand 5, react-hook-form, Zod 4, Base UI/shadcn, Tailwind 4).
- **Size:** 1,329 `.ts/.tsx` files under `src/` (~38k lines) and 187 test files.
- **Method:** about 30 files read directly (docs, providers, API client, several dialogs and hooks), plus tree-wide `grep` analysis (explicit `any`, relative imports, `useEffect`, `useMemo/useCallback`, `as` casts, unreferenced exports, duplicated helpers).
- **Limitations:** listed at the end of this file.

## Overall assessment

The frontend is **unusually healthy**. The rules in `AGENTS.md` are actually enforced in the code, not just documented.

| Check | Result |
|---|---|
| Explicit `any` | **0** |
| Relative imports (`./`, `../`) | **0** |
| `index.ts` barrels | **0** |
| `fetch` inside components/hooks | **0** (all network code is in `services/` and `app/api/`) |
| `useQuery/useMutation` directly in components | **0** |
| `useEffect` | 13 uses, all justified (timers, subscriptions, DOM sync) |
| `eslint-disable` / `@ts-ignore` | 3, all for `<img>` with a stated reason |
| Largest file (excluding `ui/` and dictionaries) | 185 lines; no God Component |
| `dangerouslySetInnerHTML` | one, a static pre-paint script (`app/layout.tsx:51`) |
| API responses | all parsed with Zod (`client.ts:67-70`); types derived with `z.infer` (86 places) |

**There are no P0 findings.** No confirmed circular dependency, no critical correctness issue, nothing that needs a rewrite.

## Key findings (13 confirmed: P0=0, P1=3, P2=10)

| # | Title | Risk | Priority |
|---|---|---:|---|
| F-01 | Two parallel form styles: ~11 hand-rolled `useState` dialogs vs 22 RHF+Zod forms | 6 | P1 |
| F-02 | Two sources for the user session (server prop + Zustand filled in `useEffect`) | 5 | P1 |
| F-03 | All ~40 dialogs imported eagerly on every portal page, no `next/dynamic` | 5 | P1 |
| F-04 | Full dictionary (40 namespaces) serialized to the client on every page | 4 | P2 |
| F-05 | String-to-enum narrowing (`Set.has(x) ? x as T`) duplicated in 18 places | 4 | P2 |
| F-06 | `pair()` helper copied 5 times, plus two near-duplicates | 4 | P2 |
| F-07 | Debounced search logic duplicated in `SearchInput` and `BookingToolbar` | 3 | P2 |
| F-08 | Zod validation failures on API responses are swallowed with no diagnostics | 4 | P2 |
| F-09 | "Explicit return type" and import rules are documented but not enforced by ESLint (20+ violations) | 3 | P2 |
| F-10 | 7 exports with no references anywhere | 2 | P2 |
| F-11 | Test gap: 0 hook tests, 7 component tests, dialog logic lives inside components | 4 | P2 |
| F-12 | Untranslated strings leak (`aria-label="Primary"`, truncated UUID shown in a select) | 2 | P2 |
| F-13 | Written rules drift from practice ("one type per file", "one hook per file") | 3 | P2 |

Highest risk score: **6** (F-01).

## Immediate recommendations

1. **No broad refactor.** The structure is sound; fix specific points only.
2. New forms use RHF+Zod+`mapApiFormError`; migrate the hand-rolled dialogs opportunistically when they are touched (F-01).
3. Fix the dual session source (F-02): small and contained.
4. Measure the initial bundle before any splitting (F-03/F-04); this audit did not measure it.
5. Add two ESLint rules (`no-restricted-imports` for relative paths, explicit return types for components) so documented rules become enforced (F-09).

## What should not change

See [09-prioritized-action-plan.md](09-prioritized-action-plan.md), section "Correct as-is".

## Inspection limitations (no claim of complete coverage)

- I did **not** run dependency tooling (madge/knip) or `next build`/a bundle analyzer. **Circular dependencies are not mechanically verified** and bundle sizes are not measured.
- Not audited: EN/AR translation parity, per-component accessibility, `app/api/**` handlers, and `services/api/auth|proxy` beyond a light look (only `client.ts` was read fully).
- The remaining ~1,300 files were covered by automated pattern searches only, not read in full.
- Lint/typecheck/tests were not run (read-only task).
