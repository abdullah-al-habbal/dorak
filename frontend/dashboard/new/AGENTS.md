# Dorak Operations — AI Agent Rules

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

- App Router routes: `/`, `/{actor}/login`, `/{actor}`, and `/{actor}/profile/*` where actor is `admin`, `manager`, or `barber`.
- Keep every application path in `src/config/routes.constant.ts` (resolvers in `routes.util.ts`); legacy flat profile paths are retired.
- Portal layouts perform canonical server session/actor validation; do not bypass them in nested routes.
- Prefer Client Components but keep `layout.tsx` SSR; add `"use client"` when necessary.
- File naming: kebab-case for files, PascalCase for component exports.
- Absolute imports only: every module specifier in `src/` and `tests/` (static/dynamic `import`, `export … from`, `vi.mock`) uses `@/`. No `./` or `../`. Enforced by ESLint `no-restricted-imports` and `tests/workspace-conventions.test.ts`.
- CSS partials are imported from `src/app/layout.tsx` via `@/` (Tailwind's CSS `@import` cannot resolve the alias); keep `default.css` → `dark.css` → `globals.css` order.
- Sole exception: `next/font/local` `path` strings are filesystem paths that Next resolves relative to the calling file, not module imports — keep them relative.

## File taxonomy

Enforced for `src/` (except `components/tailgrids/core/` and `*.d.ts`) by `tests/workspace-conventions.test.ts`:

- Enums: `<name>.enum.ts` — prefer `as const` arrays + derived unions; no `enum` elsewhere.
- Constants: `<name>.constant.ts` — every exported `SCREAMING_CASE` value; nothing callable.
- Types / interfaces: `<name>.types.ts` — every exported `type`/`interface`; no runtime exports.
- Hooks: `src/hooks/use-<name>.ts` — exactly one exported hook per file, file name = hook name.
- Utilities: `<name>.util.ts` — pure helpers, guards, mappers, formatters.
- Data access: reads in `<name>.query.ts`, writes in `<name>.mutation.ts`; never mix them in one module. Client hooks wrap them one per file (`use-login-mutation.ts`).
- React contexts live in their own `*-context.ts`; providers render, hooks consume.
- No bare catch-all names (`types.ts`, `constants.ts`, `utils.ts`, `helpers.ts`).
- Next.js special files (`page`, `layout`, `route`, `error`, `loading`, `not-found`, `proxy`) keep framework names.

## Styling rules

- Use **Tailwind CSS** with the project's **semantic tokens** (`text-text-*`, `bg-card-*`, `border-*`, etc.).
- Never hardcode hex colors — always reference tokens from `src/app/globals.css`.
- Do NOT create new CSS utility classes.
- FullCalendar overrides belong in `src/app/css/calendars.css`.

## Component rules

- **Modular sub-components**: Never place all code into a single monolithic file. Split complex UI into focused, single-responsibility sub-components in separate files (e.g. `header.tsx`, `filter-bar.tsx`, `card-item.tsx`).
- **Follow React composition best practices**:
    - **Single Responsibility**: Keep sub-components focused on one concern—separate container/state logic from presentational rendering.
    - **Composition over prop drilling**: Prefer passing `children` or using compound component patterns over passing deeply nested props through intermediate layers.
    - **Avoid inline render helpers**: Extract repeated or section-level JSX into dedicated sub-component files rather than helper functions like `renderHeader()` inside `index.tsx`.
    - **Typed prop contracts**: Define explicit, strongly typed interfaces for each sub-component in `<name>.types.ts`; only non-exported prop interfaces may stay co-located with the sub-component.
- Prefer primitives from `src/components/tailgrids/core/` (Button, Card, Badge, Select, Tabs, Dialog, etc.) over raw HTML or third-party equivalents.
- Use `react-aria` skill for accessible component architecture when building interactive primitives.
- Icons: use `@tailgrids/icons` for standard controls. For feature-local icons, place them in `icons.tsx`. Never generate SVG icons — use letter placeholders if no icon is available.
- Add `"use client"` directive when the component uses hooks, event handlers, or browser APIs.

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
