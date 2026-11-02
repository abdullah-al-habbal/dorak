---
nodeid: dashboard.guide
parentnode: repo.root
childnodes:
  - dashboard.architecture
  - dashboard.auth_contract
  - dashboard.claude
  - dashboard.references.component-and-styling-rules
  - dashboard.references.file-taxonomy
  - dashboard.references.type-safety
  - skills.dashboard
  - dashboard.guide.part-2
codeanchors:
  - frontend/dashboard/src/
  - frontend/dashboard/tests/
---

# Dorak Operations — AI Agent Rules

Documentation routes: [dashboard architecture](../../docs/architecture/frontend-architecture.md) · [repository graph](../../docs/index.md).

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

## Continued in

- [Part 2: More](agents-part-2.md)
