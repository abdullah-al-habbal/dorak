# Dashboard Frontend Architecture

## Folder boundaries

- `app/`: server-rendered routes, layouts, loading, and error boundaries.
- `components/`: presentational and narrowly interactive UI components.
- `lib/`: framework-independent utilities, claim verification, and typed API
  client primitives.
- `services/`: entity-oriented API operations built on `lib/api/client.ts`.
- `hooks/`: TanStack Query hooks that consume services and publish UI state.
- `providers/`: client-only React providers for query caching, toast rendering,
  and interactive auth state.

Dependencies flow from routes/components to hooks, hooks to services, and
services to the central API client. UI components never make HTTP calls.

## RBAC

Next `middleware.ts` verifies a short-lived signed role claim cookie. It routes
platform admins to `/admin/*` and branch managers to `/manager/*`; missing or
invalid claims redirect to `/login`. Middleware is a UX and routing boundary,
not API authorization. Laravel verifies the authenticated actor and branch
scope on every dashboard endpoint.

## Errors and notifications

The central client parses the backend envelope and normalizes errors. Query and
mutation hooks publish normalized 401, 403, validation, conflict, and server
failures through the global toast engine. Route errors use `app/error.tsx` and
root failures use `app/global-error.tsx`; errors must never be ignored.

## Banned patterns

- Top-level page `'use client'` unless the page itself needs browser APIs.
- Client-side authorization redirects in `useEffect`.
- Raw `fetch` or `axios` in routes or UI components.
- Data mutations outside typed services and TanStack Query hooks.
- Empty catches, ignored promise failures, or errors without user feedback.
