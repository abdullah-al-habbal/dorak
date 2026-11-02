---
nodeid: dashboard.guide
parentnode: repo.root
childnodes:
  - dashboard.architecture
  - dashboard.auth_contract
codeanchors:
  - frontend/dashboard/src/
  - frontend/dashboard/tests/
---

# Dorak Operations — AI Agent Rules

Documentation routes: [dashboard architecture](../../docs/frontend-architecture.md) · [repository graph](../../docs/index.md).

> Multi-actor operations platform · Next.js · Tailwind CSS · React Aria · TanStack Query

## Project structure

```
src/
  app/
    (public)/                         # public landing route
    (auth)/                           # actor login routes
    (portals)/                        # admin, manager, barber shells and profile routes
    api/auth/                         # server auth bridge
    css/  globals.css  layout.tsx  providers.tsx
  components/
    portal/                           # guarded shell, actor navigation, route factories
    status/                           # loading / error / forbidden route-state UI
    profile/                          # reusable account, security, notification UI
    tailgrids/core/                   # design-system primitives
  config/routes.constant.ts           # all application paths and portal navigation
  services/api/                       # typed server/browser API clients
  hooks/                              # client mutation/query hooks
tests/                                # Vitest suites mirroring src/ (tests/x/y.test.ts ↔ src/x/y.ts)
```

Drill into a specific folder to discover its files — naming is kebab-case for files, PascalCase for component exports.

## Next.js

This version has breaking changes — APIs, conventions, and file structure may differ from your training data. Read the relevant guide in `node_modules/next/dist/docs/` before writing any code. Heed deprecation notices.

## Conventions

- App Router routes: `/`, `/{actor}/login`, `/{actor}`, and `/{actor}/profile/*` where actor is `admin`, `manager`, `owner`, or `barber`. Operations pages (`overview`, `branches`, `bookings`, `services`, `chairs`, `stylists`) exist for `OPERATIONS_ACTORS` (`admin`, `manager`, `owner`).
- Keep every application path in `src/config/routes.constant.ts` (resolvers in `routes.util.ts`); legacy flat profile paths are retired.
- Portal layouts perform canonical server session/actor validation; do not bypass them in nested routes.
- Prefer Client Components but keep `layout.tsx` SSR; add `"use client"` when necessary.
- File naming: kebab-case for files, PascalCase for component exports.
- Absolute imports only: every module specifier in `src/` and `tests/` (static/dynamic `import`, `export … from`, `vi.mock`) uses `@/`. No `./` or `../`. Enforced by ESLint `no-restricted-imports` and `tests/workspace-conventions.test.ts`.
- CSS partials are imported from `src/app/layout.tsx` via `@/` (Tailwind's CSS `@import` cannot resolve the alias); keep `default.css` → `dark.css` → `globals.css` order.
- Sole exception: `next/font/local` `path` strings are filesystem paths that Next resolves relative to the calling file, not module imports — keep them relative.

## More

| Topic                                                                 | Read                                                                                     |
| --------------------------------------------------------------------- | ---------------------------------------------------------------------------------------- |
| File taxonomy (enums, constants, types, hooks, query/mutation)        | [`references/file-taxonomy.md`](references/file-taxonomy.md)                             |
| Styling & component composition rules                                 | [`references/component-and-styling-rules.md`](references/component-and-styling-rules.md) |
| Type safety & code quality (`any`, casts, size limits, guard clauses) | [`references/type-safety.md`](references/type-safety.md)                                 |

## Data fetching & state

- Always use `api-integration` skill for API integration.
- Client-side state: use React context or URL search params. Don't introduce new state libraries.

## Forms, charts, tables

- React Aria-backed primitives with composed label/error; Sonner `toast.*` for feedback (`Toaster` is mounted globally).
- Recharts are Client Components — wrap in Cards with `ChartContainer` and an explicit height; custom tooltips in `custom-tooltip.tsx`; unique gradient IDs per chart.
- TanStack Table for sorting/filtering/pagination; keep types, columns, mappings, and skeletons in separate feature files; render cells via `flexRender`; Badges for statuses.

## Testing

- All tests live in `tests/`, mirroring `src/` exactly: `src/services/api/auth/jwt.util.ts` → `tests/services/api/auth/jwt.util.test.ts`. Never place `*.test.*`, `*.spec.*`, `__tests__/`, `__mocks__/`, or fixtures inside `src/`.
- One test file per source module. A test file covers only the module whose path it mirrors; test other modules in their own mirrored file.
- Import code under test via the `@/` alias, never relative paths.
- `tests/workspace-conventions.test.ts` is the only non-mirrored file; it enforces these rules and the absolute-import rules in Conventions. ESLint blocks `vitest` imports inside `src/`.
- Gates for every change: `npm run lint`, `npx tsc --noEmit`, `npm test`, `npm run build`.

## Don'ts

- Don't install new packages without asking the user.
- Don't overwrite primitives in `src/components/tailgrids/core/` without asking.
- Don't create new CSS utility classes — use existing tokens.
- Don't put tests or test helpers inside `src/`.
- Don't add pages outside public, auth, portal, or API route groups without an explicit reason.
