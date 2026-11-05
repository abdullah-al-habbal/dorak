---
nodeid: docs.adr_0004
parentnode: docs.decisions
childnodes: []
codeanchors:
  - archive/
  - frontend/web/dashboard/
  - .husky/
---

# ADR 0004 — Archive the first dashboard; `frontend/web/dashboard` is the only dashboard (renamed from `new-dashboard` on 2026-11-05)

Status: `ACCEPTED` (2026-11-05)

## Decision

- `frontend/web/dashboard/` is the sole, active dashboard frontend.
- The first dashboard moved from `frontend/dashboard/` to
  `archive/frontend/legacy-dashboard/` with its Git history (renames) and local build
  output intact. The archive is read-only history: no gate, hook, CI job or guide
  refers to it, and it is not edited. Its documentation graph node ids were renamed
  to `archive.legacy_dashboard.*` so they do not clash with the live nodes.
- Live documentation describes only `frontend/web/dashboard`. Historical planning and audit
  documents keep their content and carry a banner saying they describe the archived app.
- The root Git hooks no longer use the archived app's tooling. `pre-commit` runs
  `eslint` on staged dashboard source and `npm run typecheck` when dashboard files are
  staged; `commit-msg` checks the conventional-commit header with a shell pattern.
  Both need no extra packages. The archived app's `lint-staged` and Prettier steps were
  dropped; a formatter for the dashboard is a separate dependency decision.
- **Backend contract policy:** the backend is changed when the dashboard needs a
  contract it lacks (model, resource, request, action, with Pest tests and docs),
  instead of building frontend workarounds. The mobile apps share the API, so such a
  change stays backward compatible or ships with the matching mobile change.

## Consequences

- One place to look, one set of rules, no dual-app wording.
- Rollback: move the folder back to `frontend/dashboard`, restore the hooks and revert
  the archive commit. Nothing was deleted.
- Links inside archived files that pointed at `../../docs/...` no longer resolve; that is
  accepted for read-only history.
