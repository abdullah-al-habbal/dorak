---
nodeid: archive.legacy_dashboard.guide.part-2
parentnode: archive.legacy_dashboard.guide
childnodes: []
codeanchors:
  - archive/frontend/legacy-dashboard/src/
  - archive/frontend/legacy-dashboard/tests/
---

Part 2 of 2 · [Dorak Operations — AI Agent Rules](AGENTS.md) · [Previous](AGENTS.md)

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
