# 08 — Maintainability and Technical Debt

## F-09 — Documented rules are not enforced by ESLint

- **Category:** Inconsistent Coding Patterns
- **Risk:** 3/10 · **Priority:** P2 · **Scope:** 20+ components

**Evidence:**
- `AGENTS.md` requires explicit prop and return types on every exported component. Exported components without a return type include `BookingGrid` (`booking-grid.tsx:56`), `BookingToolbar` (`booking-toolbar.tsx:37`), `OverlayHost` (`overlay-host.tsx:53`), `AppProviders`, `SessionHydrator`, `SidebarProvider`, `PortalShell`, `Sidebar`, `MobileNav`, `Breadcrumbs`, `LoginForm`, `ErrorScreen`, and more (≥20 in `components/`).
- The relative-import ban is currently respected (0 violations), but the guide states "there is no ESLint rule for it yet".

**Impact:** low today; the rule is already breached in new code, and the relative-import rule depends on discipline alone.

**Correction:** add `no-restricted-imports` with a `./*`/`../*` pattern and `@typescript-eslint/explicit-function-return-type` (or `explicit-module-boundary-types`) scoped to `src/components/**`; then fix the ~20 violations mechanically. Also decide whether inline prop types (109 components) are acceptable; `AGENTS.md` only demands explicit types, so I do not count them as violations.

**Independent.**

---

## F-10 — Unreferenced exports

- **Category:** Dead Code / Unused Exports
- **Risk:** 2/10 · **Priority:** P2 · **Scope:** 7 symbols

Each name occurs exactly once across `src/` and `tests/` (its own declaration):
`barberRejectBodySchema` (`schemas/stylists/barber-approval.zod.ts`), `EARNINGS_COMPACT_BREAKPOINT_PX` (`config/money-shell/earnings.constant.ts`), `forbiddenRoute`, `HOME_ROUTE`, `REGISTER_BUSINESS_ROUTE` (`config/routes.constant.ts`), `REVIEW_MIN_RATING` (`config/venue/review.constant.ts`), `sessionQuery` (`services/api/query/core/session.query.ts`).

**Impact:** minor noise; `routes.constant.ts` is the documented single source of paths, so unused entries there can mislead readers.
**Correction:** delete them (confirm none is used through a dynamic string first). A `knip` run would find more and keep the list clean.

---

## F-11 — Test gap for form and dialog logic

- **Category:** Difficult-to-test implementations
- **Risk:** 4/10 · **Priority:** P2 · **Scope:** ~21 dialogs and all hooks

**Evidence:** `tests/hooks/` does not exist (0 hook tests); `tests/components/` has 7 test files (branches, catalog-items, common ×2, floor-plan, jobs, overlays). The dialogs in F-01 validate and build payloads inside `submit` (`testimonial-dialog.tsx:43-72`, `catalog-item-form-dialog.tsx:67-100`), so that logic is only exercised, if at all, by Playwright against the full stack. Pure utils and schemas are well covered (`tests/lib`, `tests/schemas`).

**Impact:** payload mapping and validation regressions in admin dialogs are caught late. I did not check the backlog to see whether this gap is already tracked.

**Correction:** getting the logic out of the components (F-01) is the main fix; then unit-test schemas and mappers. Add component tests only for dialogs with real branching.

**Depends on:** F-01.

---

## F-12 — Untranslated strings leak into the UI

- **Category:** Magic Values / Inconsistent Patterns
- **Risk:** 2/10 · **Priority:** P2 · **Scope:** 2 confirmed spots

- `src/components/layout/sidebar-nav.tsx:25`: `aria-label="Primary"` is hard-coded English; Arabic screen-reader users hear English.
- `src/components/website-content/testimonial-dialog.tsx:105`: the section select shows the raw backend `section_type` plus `section.id.slice(0, 8)` (a truncated UUID), which is meaningless to an editor.

**Correction:** use a dictionary key for the label; show a human title for sections (or a backend-provided label).

---

## Inspected, no confirmed problems

- **Duplicated logic:** besides F-05/F-06/F-07, no further large duplication found in the sampled areas.
- **Function complexity:** `submit` handlers in F-01 dialogs are the longest functions (~30-40 lines), at the documented limit; nothing beyond.
- **Magic values:** statuses and codes use enums/constants; `HttpStatus` and module constants are used consistently. No raw palette colors or physical-direction utilities (`ml-`, `text-left`) were found in `components/` outside `ui/`; the only hex values are theme-color meta tags in `app/layout.tsx:36-37`.
- **Overengineering:** none observed; abstractions are used (`useSaveMutation`, `useUrlFilters`, `OverlayHost`).
