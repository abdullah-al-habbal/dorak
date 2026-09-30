# Dashboard Frontend Architecture

This document is a mandatory implementation contract. New dashboard code that
breaks it must not be merged. The dashboard uses feature-based modules and a
strict single-responsibility boundary; it is not a collection of route-local
components.

## Required directory blueprint

```text
frontend/dashboard/
├── app/                         # App Router routes, layouts, loading/errors only
├── middleware.ts                 # Edge routing/RBAC only
├── src/
│   ├── shared/                   # Cross-feature code only; no domain ownership
│   │   ├── api/                  # Typed base client and error normalization
│   │   ├── components/
│   │   │   ├── buttons/
│   │   │   ├── data-display/
│   │   │   ├── feedback/
│   │   │   ├── forms/
│   │   │   └── layout/
│   │   ├── enums/
│   │   ├── hooks/
│   │   ├── schemas/
│   │   ├── theme/                # Design tokens and theme primitives
│   │   └── types/
│   └── features/
│       └── <feature>/
│           ├── api/              # Feature endpoint callers only
│           ├── components/
│           │   ├── dialogs/
│           │   ├── forms/
│           │   ├── tables/
│           │   └── cards/        # Create only when the feature needs cards
│           ├── enums/
│           ├── hooks/            # TanStack Query hooks only
│           ├── schemas/          # Feature-local Zod schemas only
│           └── types/            # Feature domain contracts only
│   └── providers/                # Narrow client-only providers
└── tests/
```

Features include `branches`, `services`, `chairs`, `stylists`, `bookings`, and
`overview` as they are implemented. A feature owns its domain types, schemas,
endpoint functions, hooks, and UI. `shared/` may contain only genuinely
cross-feature primitives; duplicating a domain feature in `shared/` or putting
generic primitives in a feature is prohibited.

`app/` is intentionally thin: a route composes layouts and feature entry
components. It does not contain API access, validation schemas, complex client
state, or domain business rules.

## Responsibility and dependency rules

One file has one responsibility:

- `types/` and `enums/` declare contracts and constants only.
- `schemas/` validate only; they do not call APIs or render UI.
- `api/` calls the central API client only; it does not use React or TanStack
  Query.
- `hooks/` compose TanStack Query and expose data/actions to UI; they do not
  render markup.
- `components/` render props and invoke supplied callbacks/hooks; they never
  make HTTP calls or own cross-domain orchestration.
- Pages and layouts compose feature components and remain server components
  unless browser interactivity is essential.

Allowed dependency direction is:

```text
app → feature components → feature hooks → feature api → shared/api
                       ↘ feature schemas/types/enums
shared components → shared hooks/types/theme only
```

Reverse imports, direct feature-to-feature imports, and UI imports of feature
`api/` modules are prohibited. Share a small, domain-neutral primitive only
when at least two features demonstrably need it.

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
- Mixing schemas, endpoint calls, state orchestration, and substantial JSX in
  one file.
- Flat, uncategorized component directories or duplicate shared primitives.
- Raw hex, RGB, HSL, arbitrary Tailwind color values (for example
  `bg-[#1a202c]`), or ad-hoc spacing values in components. Components use
  semantic Tailwind utilities backed by centralized CSS variables/tokens.
- Direct state-object mutation. State transitions occur through an owned hook,
  reducer, or TanStack Query cache update.

## Design system

All visual color, radius, shadow, typography, and spacing decisions are
defined in `src/shared/theme/`, CSS variables, and the Tailwind theme. UI uses
semantic tokens such as `bg-background`, `text-foreground`, `bg-primary`, and
`border-destructive`; it never embeds a palette literal. A new visual value
requires a token addition and design review, not an arbitrary class.

## Enforcement gates

Architecture is enforced in code review and CI, not by convention alone.

- ESLint uses restricted imports to ban `fetch`/`axios` outside
  `src/shared/api/` and feature `api/` modules, and to ban feature API imports
  from route/UI files.
- ESLint boundary rules restrict feature imports to their own feature plus
  `shared/`; import aliases are configured so relative-path escapes are
  detectable.
- ESLint rejects empty catches, floating promises, prohibited page-level
  client directives, arbitrary color classes, and raw color literals.
- A structural test verifies each feature directory contains only approved
  subdirectories and categorizes all feature components.
- `npx tsc --noEmit`, lint, dashboard tests, and the backend dashboard feature
  tests are mandatory PR/commit gates. Each feature is validated before the
  next feature begins.

When a rule cannot be mechanically enforced, the exception must be local,
documented with a justification, and approved in review; blanket disables are
not allowed.
