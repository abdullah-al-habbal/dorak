# 07 — Dependencies and Module Boundaries

**Inspected:** import style, barrels, direction of dependencies between layers (components → hooks → services/lib), the `OverlayHost` fan-out.

## Findings

**No confirmed issues.** Details:

- **Import conventions:** 0 relative imports across 1,329 files; all imports use `@/` (and `@tests/` in tests). Consistent.
- **Barrels:** none. No `index.ts` re-export chains.
- **Dependency direction:** the observed direction is components → hooks → services/lib → schemas/types/enums/config. `components/` never calls `fetch` and hooks do not import components. Dialogs reach `OverlayProvider` only through `useOverlay` (context), so `OverlayHost` importing dialogs and dialogs calling `useOverlay` does **not** create a cycle.
- **Feature coupling:** `OverlayHost` is a deliberate hub that imports ~40 dialogs (`overlay-host.tsx:3-42`). It is a coupling point by design; its cost is bundle size, not maintainability (see F-03 in [10-performance-and-bundle.md](10-performance-and-bundle.md)).
- **Dependencies in `package.json`:** the runtime set is lean. Two items to confirm with the owner, not confirmed problems: the `cn` package (a separate npm package named `cn` alongside `lib/utils.ts`'s own `cn`) and `shadcn` listed as a runtime dependency (it is normally a dev/CLI tool). I did not verify whether either is imported.

## Not verified (limitation)

Circular dependencies were **not** checked with a tool (madge/dependency-cruiser), because no such tool is installed and installing one was out of scope. Based on the layering above I do not expect cycles, but this is an unverified expectation, not a finding. A one-off `madge --circular` run is a cheap follow-up.
