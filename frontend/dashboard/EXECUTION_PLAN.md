# Multi-Actor Frontend Execution Plan

## Status

- [x] Architectural audit complete
- [x] Phase 0 — Lock architecture contracts
- [x] Phase 1 — Establish route topology
- [x] Phase 2 — Build the auth bridge and Next.js 16 proxy layer
- [x] Phase 3 — Introduce true SSR locale and direction handling
- [x] Phase 4 — Recompose the portal shell and navigation
- [x] Phase 5 — Migrate profile and account experiences
- [x] Phase 6 — Providers and data-access hardening
- [x] Phase 7 — Final clean-slate cleanup and branding
- [x] Phase 8 — Verification gates

## Phase 0 — Lock architecture contracts

- [x] Define the shared backend/frontend actor model.
  - [x] Canonical guards are `admin`, `branch`, and `barber`.
  - [x] The frontend portal name `manager` maps to the backend `branch` guard.
  - [x] Map `admin` to `/admin`, `branch` to `/manager`, and `barber` to `/barber`.
  - [x] Define the required session claims: actor/guard, user ID, expiry, permissions, and branch ID for branch-scoped actors.
  - [x] Define cross-portal behavior: redirect users to their authorized portal; use a forbidden response only when no authorized portal can be determined.
- [x] Define the authentication transport and backend bridge.
  - [x] Prefer server-managed, secure, HttpOnly, SameSite cookies.
  - [x] Confirm login, refresh, logout, current-session, and token-validation endpoints with the backend.
  - [x] Confirm whether `proxy.ts` validates a signed JWT locally or delegates validation to the backend.
- [x] Define locale and direction policy.
  - [x] Record supported locales and the default locale.
  - [x] Map each locale to `ltr` or `rtl`.
  - [x] Keep canonical actor URLs and persist locale in a server-readable cookie unless localized URL segments are explicitly required.
- [x] Record the frontend contract and backend confirmations needed before Phase 2 in project documentation.

## Phase 1 — Establish route topology

- [x] Create a public route group with a landing page at `/`.
  - [x] Keep it independent of the authenticated application shell.
  - [x] Add actor-oriented entry points to the appropriate login flow.
- [x] Create an authentication route group for login entry routes.
- [x] Create portal route topology for `/admin`, `/manager`, and `/barber`.
  - [x] Give each actor an independent layout boundary.
  - [x] Reserve a shared portal-shell composition for Phase 4.
  - [x] Add route-level loading, error, forbidden, and not-found states.
- [x] Retire the root dashboard route; retain the flat profile tree until its Phase 5 migration.

## Phase 2 — Build the auth bridge and Next.js 16 proxy layer

- [x] Create a typed, server-safe session module that reads trusted cookie data only.
- [x] Expose a minimal client auth context hydrated from server-validated session data.
- [x] Add `proxy.ts` for public-route bypass, protected-route enforcement, safe callback redirects, and actor/guard matching.
- [x] Revalidate sessions in protected layouts and sensitive server requests.
- [x] Handle expiry, malformed claims, refresh failure, unavailable validation, and unsupported actors.

## Phase 3 — Introduce true SSR locale and direction handling

- [x] Add typed locale and direction registries plus server dictionary loading.
- [x] Resolve locale from a validated cookie, then `Accept-Language`, then the default locale.
- [x] Render server-derived `<html lang>` and `<html dir>`.
- [x] Replace client-only initial direction storage to avoid FOUC and hydration mismatch.
- [x] Configure React Aria from the resolved locale.
- [x] Replace remaining application physical directional styles with logical equivalents.
- [x] Move public, shell, profile, metadata, aria-label, placeholder, empty-state, and error copy into dictionaries.

## Phase 4 — Recompose the portal shell and navigation

- [x] Split the generic shell into portal frame, responsive sidebar, header actions, actor navigation, and session menu components.
- [x] Define translated, actor-specific navigation models with permission filtering.
- [x] Make the shell mobile-first for mobile, tablet, desktop, and ultra-wide screens.
- [x] Verify keyboard, focus, reduced-motion, LTR, and RTL behavior for all navigation primitives.

## Phase 5 — Migrate profile and account experiences

- [x] Move profile routes beneath each protected actor portal.
- [x] Move account, security, and notifications to the chosen protected profile topology.
- [x] Derive profile links, labels, active state, and identity from portal/session context.
- [x] Hydrate available account identity from the backend-validated server session.
- [x] Retire flat profile routes behind server-validated migration redirects.

## Phase 6 — Providers and data-access hardening

- [x] Order providers around server-derived locale/direction, theme, query client, auth/session, and toast boundaries.
- [x] Configure React Query to avoid retries for authorization failures and invalidate on logout/session change.
- [x] Establish typed API client errors, credential behavior, and trusted actor/branch scoping.
- [x] Add profile, security, and notification mutation APIs once backend endpoint contracts are available.

## Phase 7 — Final clean-slate cleanup and branding

- [x] Remove only components and routes proven unused after the route migration.
- [x] Remove dead utilities, CSS, imports, template prompts, and legacy navigation configuration.
- [x] Rename package and product metadata to Dorak Operations.
- [x] Confirm no tracked public or template-gallery assets remain to stage.
- [x] Update `AGENTS.md` with the route topology, `proxy.ts`, authentication, locale, and navigation conventions.

## Phase 8 — Verification gates

- [x] Add automated coverage for proxy decisions, secure token exchange, session expiry, invalid claims, safe callbacks, SSR locale/direction, and actor navigation.
- [x] Verify public, authentication, and each portal route in LTR/RTL through build route generation and typed navigation contracts.
- [x] Require lint, type check, production build, and unit/integration tests to pass.
- [x] Scan for hardcoded copy, retired flat-profile links, proxy references, dead imports/assets, and template branding.

## Acceptance criteria

- [x] `/` is a public landing page.
- [x] `/admin`, `/manager`, and `/barber` have distinct portal topology and secure actor isolation.
- [x] Initial SSR output has the correct language and direction.
- [x] Shell and profile copy is localized.
- [x] Cleanup is staged and documented.
- [x] All validation gates pass.
