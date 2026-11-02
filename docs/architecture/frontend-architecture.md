---
nodeid: dashboard.architecture
parentnode: dashboard.guide
childnodes: []
codeanchors:
  - frontend/dashboard/src/app/
  - frontend/dashboard/src/proxy.ts
  - frontend/dashboard/src/services/api/
  - frontend/dashboard/src/config/routes.constant.ts
---

# Dashboard Frontend Architecture

This guide records the architecture currently present in `frontend/dashboard/`.
The implementation and its local contracts are the source of truth; this file
routes contributors to those contracts rather than prescribing an unused
directory blueprint.

Routes: [dashboard guide](../../frontend/dashboard/AGENTS.md) · [authentication contract](../../frontend/dashboard/docs/architecture/frontend-auth-contract.md) · [documentation graph](../index.md).

## Application structure

- `src/app/` contains the Next.js App Router pages, layouts, and route handlers.
- `src/proxy.ts` enforces public and protected route behavior and actor/session
  checks for the Next.js 16 application.
- `src/components/` contains portal shells and feature UI.
- `src/services/api/` owns typed backend requests and API response handling.
- `src/config/routes.constant.ts` and its companion utilities define canonical
  application paths and navigation.
- `tests/` mirrors source modules and contains the Vitest suites.

## Authentication and data access

Portal layouts validate actor and session context. Browser requests use the
server managed session contract and the dashboard API bridge; sensitive backend
operations remain authorized by Laravel. Read the
[frontend authentication contract](../../frontend/dashboard/docs/architecture/frontend-auth-contract.md)
and [backend additions](../../frontend/dashboard/docs/architecture/backend-additions.md)
before changing that boundary.

Keep backend calls in the typed API services. Route handlers and server
components must use the existing request helpers so timeout, error, and session
behavior stays consistent.

## Conventions and verification

Follow [frontend/dashboard/AGENTS.md](../../frontend/dashboard/AGENTS.md) for
current import, file taxonomy, styling, testing, and quality-gate requirements.
All planned dashboard tasks (1–87) are complete; open work is tracked in
[open decisions](../decisions-required.md).
