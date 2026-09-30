# Dashboard Implementation Plan

This plan implements a short-lived signed dashboard role claim for Next.js Edge
middleware. Laravel remains the authorization authority for every API request.

## Task 1: Backend Dashboard API Architecture (`backend/`)

- [ ] Create `Modules/Dashboard` with a service provider, API routes, actions,
  handlers/resolvers, resources, policies, and feature-test namespace.
- [ ] Register `DashboardServiceProvider` in `bootstrap/providers.php`.
- [ ] Confirm routes are loaded through the module provider at exactly
  `/api/v1/dashboard/*`; do not duplicate the `api/v1` prefix.
- [ ] Define a dashboard actor/capability abstraction: `AdminModel` is
  `platform_admin`; `BranchModel` is `branch_manager` scoped to its branch.
- [ ] Add dashboard authentication/session exchange endpoints that authenticate
  an admin or branch manager and issue a short-lived signed role claim cookie.
- [ ] Define claim payload: subject ID, actor type, role, branch ID when
  applicable, issued-at, expiry, issuer, and token identifier.
- [ ] Sign claims using a dedicated rotation-capable dashboard session secret;
  set `HttpOnly`, `Secure`, `SameSite`, `Path`, and expiry cookie attributes.
- [ ] Add logout/revocation behavior that clears the role-claim cookie and
  invalidates the token identifier where server-side revocation is required.
- [ ] Implement `DashboardAuthorizationMiddleware` that resolves the Sanctum
  actor and verifies platform/manager capability server-side.
- [ ] Ensure branch managers cannot access or mutate any resource outside their
  branch, including nested chairs, bookings, stylists, and offered services.
- [ ] Add `GET /api/v1/dashboard/overview` with role-scoped metrics: revenue,
  bookings, active branches/salons, and stylists.
- [ ] Add branch endpoints: `GET`, `POST`, `PUT`, `DELETE`
  `/api/v1/dashboard/branches`; restrict platform-wide operations to admins.
- [ ] Add service endpoints: `GET`, `POST`, `PUT`, `DELETE`
  `/api/v1/dashboard/services`; scope manager operations to branch offerings.
- [ ] Add chair endpoints: `GET`, `POST`, `PUT`, `DELETE`
  `/api/v1/dashboard/chairs`; apply branch ownership checks.
- [ ] Add stylist endpoints: `GET`, `POST`, `PUT`, `DELETE`
  `/api/v1/dashboard/stylists`; preserve affiliation and workstation rules.
- [ ] Add booking endpoints: `GET /api/v1/dashboard/bookings` and
  `PATCH /api/v1/dashboard/bookings/{booking}` with role-scoped listings.
- [ ] Route booking status changes through the Phase 4 lifecycle service; never
  write status directly or permit terminal/out-of-order transitions.
- [ ] Return every action through the existing unified API envelope seam.
- [ ] Add feature tests for envelope shape, actor authorization, tenant scope,
  lifecycle rejection, dashboard claim issue/expiry, and logout/revocation.

## Task 2: Next.js Frontend Core Infrastructure (`frontend/dashboard/`)

- [ ] Add a server-safe dashboard session/claim verification utility using an
  Edge-compatible signing library and environment-held verification secret.
- [ ] Add `middleware.ts` that reads the signed role claim without calling a UI
  component or `useEffect`.
- [ ] Redirect unauthenticated `/admin/*` and `/manager/*` requests to login.
- [ ] Redirect managers away from `/admin/*` and admins away from `/manager/*`.
- [ ] Keep middleware routing-only; backend API authorization remains mandatory.
- [ ] Create server-rendered route clusters `app/(auth)`, `app/(admin)`, and
  `app/(manager)` with appropriate layouts and loading states.
- [ ] Keep page components server components unless a page itself requires
  browser interactivity; isolate interactive controls into client components.
- [ ] Replace the basic API helper with `lib/api/client.ts` typed request APIs,
  envelope parsing, credentials support, and `DashboardApiError` normalization.
- [ ] Define normalized error semantics: 401 unauthenticated, 403 forbidden,
  422 validation, 409 conflict, and 5xx server failure.
- [ ] Add a global API-error event boundary that maps normalized failures to
  toast events; do not silently swallow failures.
- [ ] Add Sonner/Shadcn toast provider and exported `showSuccess`, `showError`,
  and `showWarning` utility functions.
- [ ] Add `app/error.tsx` and `app/global-error.tsx` with recovery controls and
  correlation/error identifiers where available.
- [ ] Configure `QueryClientProvider` with explicit stale time, retry rules, and
  query/mutation error handling.
- [ ] Create `services/` modules that are the only place invoking the API client.
- [ ] Create `hooks/` query and mutation hooks; components consume hooks, never
  raw `fetch` or `axios`.
- [ ] Add an `AuthProvider` or small auth store exposing claim-derived role,
  permissions, and authenticated actor state to interactive descendants.
- [ ] Add login/logout flows that establish and clear the signed role claim.
- [ ] Add frontend tests for middleware RBAC, client normalization, toast error
  mapping, and query-hook behavior.

## Task 3: Architecture and Anti-Pattern Documentation

- [ ] Maintain `docs/FRONTEND_ARCHITECTURE.md` as the dashboard implementation
  contract before adding dashboard feature screens.
- [ ] Document folders: `app/`, `components/`, `lib/`, `hooks/`, `services/`,
  `providers/`, and their allowed dependency direction.
- [ ] Document middleware RBAC rules, signed-claim payload constraints, expiry,
  and backend-authority boundary.
- [ ] Document API error normalization and the interceptor-to-toast flow.
- [ ] Explicitly ban top-level page `'use client'` without need, useEffect-based
  routing authorization, component-level raw HTTP, and swallowed errors.
- [ ] Record validation commands: backend feature/full suite, `npx tsc --noEmit`,
  dashboard build, and dashboard frontend tests.

## Phase 2 Entry Criteria

- [ ] This plan and `FRONTEND_ARCHITECTURE.md` are committed.
- [ ] Signed-claim role model is approved: admin maps to `/admin`, branch
  manager maps to `/manager`, and Laravel remains authoritative.
- [ ] Dashboard feature implementation has explicit approval.
