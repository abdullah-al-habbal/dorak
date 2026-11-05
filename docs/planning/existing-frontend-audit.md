---
nodeid: docs.audit.frontend
parentnode: docs.audit
childnodes:
  - docs.audit.frontend.part-2
  - docs.audit.frontend.part-3
  - docs.audit.frontend.part-4
codeanchors:
  - archive/frontend/legacy-dashboard/src/
  - backend/modules/Dashboard/
---

> **Historical.** This document describes the first dashboard, archived at
> `archive/frontend/legacy-dashboard/` (see [ADR 0004](../adr/0004-archive-legacy-dashboard.md)). The active
> dashboard is `frontend/web/new-dashboard/`.

# Existing Dashboard Frontend Audit

> Read-only inventory of `frontend/dashboard` (now `archive/frontend/legacy-dashboard`) and the backend guards it depends on, dated 2026-11-03. Input for the planned Next.js rebuild. No code was changed.

Part 1 of 4 · [Guards](existing-frontend-audit-part-2.md) · [Endpoints and models](existing-frontend-audit-part-3.md) · [Forms, workflows, findings](existing-frontend-audit-part-4.md)

## Method and evidence

- Read: `src/app`, `src/config`, `src/services/api`, `src/components/entities`, `src/hooks`, the dashboard route file and the four dashboard middleware classes.
- Role names: **Admin** = `admin`/`platform_admin`; **Owner** = `owner`/`brand_owner` (a client account owning a brand, ADR 0001); **Manager** = `manager`/`branch_manager` (a branch login); **Stylist** = `barber` (backend term).
- Findings are graded confirmed (traced in code) or plausible.

## Stack

- Next.js 16.2.7 App Router, React 19.2.4, Tailwind 4, React Aria / Base UI on a Tailgrids primitive kit.
- TanStack Query 5 and Table 8, react-hook-form with zod 4, sonner toasts, next-themes.
- Laravel Echo with pusher-js for private channels `branch.{id}` and `barber.{id}`.
- Vitest with 87 test files; checks are `lint`, `typecheck`, `test`, `architecture:check`.
- Bilingual EN and AR dictionaries in `src/i18n/messages`; Arabic font bundled.

## Architecture in brief

- Browser never holds the API token. Next route handlers under `src/app/api` are a backend-for-frontend.
- Three HTTP-only cookies: `dashboard_claim` (signed session claim), `dashboard_access`, `dashboard_refresh`.
- `src/proxy.ts` is the edge gate: verifies the claim, refreshes on expiry, redirects to `/{actor}/login?callbackUrl=`, and bounces a signed-in actor away from other actors' portals.
- Each `(portals)/{actor}/layout.tsx` repeats a canonical server check against `/dashboard/me`.
- Four portals share one pattern: `/{actor}`, `/{actor}/login`, `/{actor}/profile/{account,security,notification,settings}`.
- Operations pages exist for admin, manager and owner. The barber portal is a single workspace page.
- Admin has 10 extra platform pages (see part 3).

## Inventory counts

| Item | Count |
| --- | --- |
| Page files under `(portals)` | 108 (20 are profile tabs) |
| Auth BFF routes | 3 (login, logout, refresh) |
| Other BFF routes | dashboard, barber, lookups, notifications, realtime auth, health |
| Dashboard BFF allowlist rules | about 60 regex rules |
| Barber BFF allowlist rules | 12 |
| Zod form schemas | 20+ |
| Portal navigation items | 21 |

## Conventions that bind a rebuild

- `@/` imports only; ESLint and `workspace-conventions.test.ts` enforce it.
- All paths live in `src/config/routes.constant.ts`; navigation lives in `PORTAL_NAVIGATION`.
- Files are kebab-case; suffixes `.constant`, `.util`, `.types`, `.schema`, `.query`, `.mutation`.
- Money is held in minor units and converted with `fromMinorUnits`.
