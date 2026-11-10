---
nodeid: dashboard.guide
parentnode: repo.root
childnodes:
  - dashboard.architecture
  - dashboard.claude
codeanchors:
  - frontend/web/dashboard/src/
  - frontend/web/dashboard/tests/
---

# Dorak Dashboard - Agent Guide

The only dashboard in the monorepo. One workspace per role at
`/dashboard/<guard>` (`admin`, `manager`, `barber`, `owner`). Repository-wide rules
in the root [AGENTS.md](../../../AGENTS.md) apply; this file adds the dashboard rules.

Docs: [architecture](../../../docs/architecture/frontend-architecture.md) ·
[feature modules plan](../../../docs/feature-modules-plan.md) ·
[source layout](src/README.md) · [ADR 0003](../../../docs/adr/0003-new-dashboard-foundation.md) ·
[design decisions](.interface-design/system.md).

<!-- BEGIN:nextjs-agent-rules -->

## This is NOT the Next.js you know

This version has breaking changes — APIs, conventions, and file structure may all differ from your training data. Read the relevant guide in `node_modules/next/dist/docs/` (resolved from this file's directory; in monorepos the `next` package may not be visible from the repo root) before writing any code. Heed deprecation notices.

This block is written and re-added by `next dev` — verify at `node_modules/next/dist/server/lib/generate-agent-files.js`. Removing it from a diff only re-creates the uncommitted change; committing it with your work keeps the tree clean.

<!-- END:nextjs-agent-rules -->

## Stack

Next.js 16 (App Router), React 19, TypeScript, Tailwind 4, shadcn/ui on Base UI,
TanStack Query, Zod, react-hook-form, Zustand (theme and auth profile only), Sonner.
No axios, no i18n library, no calendar or chart library. **Do not install packages
without asking the user.**

## Conventions

- **Imports:** `@/` (and `@tests/` in tests) only. Never `./` or `../`. Imports stay at the
  top of the file. `.claude/skills/monorepo-task-executor/scripts/check-conventions.sh` flags relative imports; there is no
  ESLint rule for it yet, so check it yourself.
- **File taxonomy** (details in [src/README.md](src/README.md)): one `.type.ts`,
  `.interface.ts`, `.zod.ts` or `.enum.ts` per file; constants in `.constant.ts`; pure
  helpers in `.util.ts`; one hook per file named `use-<name>.ts`; reads in
  `services/api/query/*.query.ts`, writes in `services/api/mutation/*.mutation.ts`; no
  catch-all names (`types.ts`, `helpers.ts`, `constants.ts`); `lib/utils.ts` is shadcn's generated file and the one exception.
- **Routes:** all application paths live in `src/config/routes.constant.ts`. Portal layouts
  validate the session and actor; do not bypass them in nested routes. Backend dashboard
  paths are used as they are (for example `/stylists`); the proxy does no renaming.
- **Data:** the browser only calls `/api/dashboard/*` and `/api/auth/*`
  (`app/api/**`), never Laravel. Every response is parsed with Zod before use. Server state
  is TanStack Query with keys from one factory per module; client state stays minimal.
- **Backend gaps:** if the UI needs a field, filter or endpoint that the backend lacks, change
  the backend (see the root backend contract policy) instead of adding a frontend workaround.
- **Auth and security:** tokens live only in HttpOnly cookies. The backend is the authority for
  authorization and branch scope; the proxy allow-list is defence in depth. Render server
  strings as text, never HTML.

## Shared primitives (mandatory reuse)

Every dashboard change, whether a feature, fix, hotfix, refactor or review, reuses the shared
hooks and helpers from the refactor batches instead of writing new copies: `useUrlFilters`/`useUrlState`/`useReplaceQuery`,
`resolvePageInfo`, `useDeleteMutation`, `useSaveMutation`, `useReferenceQuery`/`STALE_TIME`,
`HttpStatus`, `createQueryKeys`, the `schemas/fields/` builders, `mapApiFormError`,
`useOptimisticToggleMutation`, `useFeedbackMutation` and `useListQuery`. The full table, the extend-don't-fork rule and the behaviour each
migration must keep are in
[dashboard-shared-primitives.md](../../../.claude/skills/monorepo-task-executor/references/dashboard-shared-primitives.md).
Reviews flag any re-implementation.

## Type safety and quality

- No explicit `any`. Do not cast external data (API bodies, `JSON.parse`, form input)
  with `as` without a Zod parse or type guard first.
- Every exported function, hook and component has explicit prop and return types.
- Keep modules focused: split a file that passes about 300 lines or a function that passes
  about 40 lines. Extract repeated JSX into sub-component files, not inline render helpers.
- Four or more related parameters become a typed object.
- No magic strings or numbers for statuses, limits or codes: use the module's enum or constant.
- Prefer guard clauses and early returns over nested `if/else`.
- `useCallback` only where identity matters: a handler passed to a `memo` component
  (`WorkingHoursDayRow`, the only `memo` row; give it props that keep their identity between renders, such as the shared `NO_ISSUES` array), or a function a hook must keep stable
  (a serialiser handed to `useUrlState`, an effect dependency). Do not wrap handlers passed to
  ordinary components or DOM elements, and drop a `useMemo` whose only dependency is such a
  function. The React Compiler is not enabled. Keep local UI state local.

## UI

- Use the shared `frontend-design` and `interface-design` skills from the root
  `.claude/skills/`, and record decisions in `.interface-design/system.md`.
- Use the local `shadcn`, `migrate-radix-to-base` and `web-design-guidelines` skills in
  `.claude/skills/`; run `web-design-guidelines` before shipping UI changes.
- Compose from `components/ui` primitives and semantic tokens (`bg-card`,
  `text-muted-foreground`), not hex colours or raw Tailwind palette values. Do not add new
  CSS utility classes.
- Every list ships loading, empty, filtered-empty, error and forbidden states. Status is never
  conveyed by colour alone. Use logical properties (`ms-`, `me-`, `start-`, `end-`) so RTL works.
- Add `"use client"` only where hooks, handlers or browser APIs are used.

## Testing and gates

- Tests live in `tests/`, mirroring `src/` (`src/lib/x.util.ts` -> `tests/lib/x.util.test.ts`).
  No test files inside `src/`. Vitest runs in the Node environment, so test pure logic and
  route handlers; component tests need `jsdom` and Testing Library, which require approval.
- Before closing any change, from this directory: `npm run lint`, `npm run typecheck`,
  `npm test`, `npm run build`.
- **Playwright E2E** (`npm run test:e2e`, specs in `tests/e2e/`): runs against the **real stack**: Next.js on
  3000 and the Laravel API on 8000. Each server is reused when already running, otherwise Playwright starts
  a production build (`npm run build && npm start`; `next dev` fails on the Google Fonts fetch in sandboxed runs,
  so stop a running `next dev` first) and `php artisan serve`. Always run it as `TZ=UTC npx playwright test`
  (see the task executor's `references/gates.md`). Projects: desktop 1440x900, `mobile-390`, `ultrawide-3440`
  (cached Chromium; `npm run test:e2e:install` if missing).
  `tests/e2e/support/global-setup.ts` runs `php artisan migrate:fresh --seed` plus
  `backend/database/seeders/E2eDashboardSeeder.php` (**this wipes the dev database**), then signs the seeded
  manager (`e2e-manager@dorak.test`) and the seeded brand owner (`e2e-owner@dorak.test`) in once and saves the sessions to `tests/e2e/.auth/` (gitignored). Owner-only specs use `test.use({ storageState: E2E_OWNER_STORAGE_STATE })` and `signIn(page, locale, "owner")`.
  Specs reuse that session; auth specs start signed out. `resetBackend()` re-runs the E2E seeder, which restores
  the baseline (no saved working hours, today's two bookings). When a spec needs other data, extend the seeder.
  Backend `.env` must set `DASHBOARD_LOGIN_ATTEMPTS_PER_MINUTE` above the default 5 (the auth specs sign in
  through the form). `signIn` hides the dev-only Next issue badge, which otherwise covers bottom-anchored
  controls on phones.
- **Working hours** (`/dashboard/[guard]/working-hours`): reads and writes `GET|PUT /branches/{id}/opening-hours`
  (up to four shifts per day). See `backend/docs/feature-index.md`.
