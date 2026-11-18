# 09 — Prioritized Action Plan

Totals: **13 confirmed findings — P0: 0, P1: 3, P2: 10.** Highest risk: 6.

## P0 — Immediate intervention

None. Nothing creates a correctness, dependency or architectural emergency.

## P1 — Planned intervention (during upcoming feature work)

| ID | Title | Risk | Fix size |
|---|---|---:|---|
| F-01 | Two form styles (hand-rolled `useState` dialogs) | 6 | Incremental: migrate when touched; ban new hand-rolled dialogs |
| F-02 | Session in two places (prop + Zustand filled in effect) | 5 | Small: seed the store synchronously |
| F-03 | All dialogs eagerly bundled | 5 | Measure first; then `next/dynamic` in `OverlayHost` |

## P2 — Gradual improvement

| ID | Title | Risk |
|---|---|---:|
| F-04 | Whole dictionary shipped to client | 4 |
| F-05 | Enum narrowing duplicated (18 Sets) | 4 |
| F-06 | `pair()` duplicated ×5 (+2 similar) | 4 |
| F-08 | Zod response-validation failures swallowed | 4 |
| F-11 | Test gap for dialog/form logic | 4 |
| F-07 | Debounced search duplicated | 3 |
| F-09 | Rules not enforced by ESLint | 3 |
| F-13 | Written rules drift from practice | 3 |
| F-10 | 7 unreferenced exports | 2 |
| F-12 | Untranslated strings | 2 |

## Recommended order and dependencies

1. **Quick wins, no dependencies (one small PR each):** F-08 (log Zod issues), F-02 (seed session), F-07 (reuse `SearchInput`), F-10 (delete dead exports), F-12 (two strings).
2. **Enforcement:** F-09 (ESLint rules) before or with the next few features, so new code does not add violations; F-13 (reword the rules) at the same time.
3. **Shared helpers:** F-05 (`parseEnumValue`) and F-06 (`toLocalePair`), both small and backward compatible.
4. **Measure:** run `next build` with the bundle analyzer; decide on F-03 and F-04 from numbers.
5. **Incremental migration:** F-01 per dialog, starting with the website-content trio (testimonial, section, page), which also benefits from F-06. F-11 follows naturally: once validation is in Zod schemas, tests are cheap.

**Single root-cause fixes:**
- *One change resolves several findings:* adopting RHF+Zod in a dialog (F-01) removes its `pair()` copy (F-06), its 422 boilerplate, and its testing gap (F-11).
- *One lint configuration covers F-09 and part of F-05:* a rule against `as <Enum>` on form input keeps casts from returning.

## Correct as-is (do not change)

- Zero `any`, zero relative imports, zero barrels; keep the conventions.
- Network access isolated in `services/` and `app/api/`; no fetching in components.
- Zod-first API contract with `z.infer` types (no schema/type duplication).
- The shared hook layer (`useListQuery`, `useSaveMutation`, `useFeedbackMutation`, `useUrlFilters`, …); a good abstraction, actually reused.
- `OverlayHost` + `OverlayKind` as the single dialog mount point (only add lazy loading, F-03).
- All 13 `useEffect` uses and the "adjust state during render" pattern in `SearchInput`.
- `useFloorPlanEditor`: derived `dirty`, `key`-based reset.
- Coarse `invalidate: [xKeys.all]`: no evidence of harm.
- Single-field reason dialogs (ban/reject/dispute) built with plain `useState`: appropriate for their size.
- Domain-grouped folder layout and the density rule; do not mass-merge files (F-13 is a documentation fix).
