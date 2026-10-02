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
│   │   ├── auth/                 # Roles, areas, branch scope, route guards
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

## Entity Engine

The Entity Engine is the one sanctioned exception to the `shared/` rule above.
A CRUD entity that differs only in shape — columns, fields, validation, endpoint
— is declared once as a config instead of being hand-written per feature.

```text
src/shared/entities/
├── types/       # Config, column, field, detail, renderer contracts
├── fields/      # Field control definitions and tree inference
├── configs/     # One config per entity + the slug registry
├── domain/      # Domain record contracts owned by configs
├── ui/          # EntityTable, EntityForm, EntityShow
├── workflows/   # Per-entity overrides that the config tree cannot express
├── field-schema.ts       # Field tree -> Zod contract
├── field-coercions.ts    # Blank form/API value normalization
├── entity-api.ts         # CRUD client
└── entity-hooks.ts       # React Query hooks + cache invalidation
```

Rules:

- The engine owns no domain knowledge. `shared/entities/domain/` holds record
  contracts, and `shared/entities/configs/` holds field/column/validation
  declarations. Nothing else in `shared/` may import an entity config.
- A config imports the engine through deep module paths, never through the
  `src/shared/entities` barrel, because the barrel also exports the registry
  that loads configs. This keeps `import/no-cycle` satisfied.
- `app/(dashboard)/[area]/[entity]/` resolves any registered slug whose
  `access` grants the operation the route performs — `read` for list and show,
  `create` for the create form, `edit` for the edit form — and calls
  `notFound()` otherwise. A legacy static route always wins over the dynamic
  segment, so entities migrate incrementally.
- `access` is declared per operation rather than per entity, because the two
  actors do not share a surface on every entity. An omitted operation grants
  nobody, which is how an entity declares that it has no such form.
- An override earns its place only by expressing something the config tree
  cannot. `renderForm` covers a custom form, `renderShow` a custom detail
  layout, and `rowActions` per-row controls the View link does not cover. A list
  override is no longer needed: a config declares its columns, its filters, and
  its row actions, and `EntityTable` renders all of them. Prefer widening the
  config contract over adding a second hand-written table.
- A filter is declared once with both names it needs — `key` for the URL
  (`chair_id`) and `param` for the list field (`chairId`) — so the engine
  rebuilds the query from the URL and a list never re-reads `useSearchParams`
  by hand. Static values use `options`; a filter whose values come from the API
  uses `renderOptions`.
- Every label the engine renders is a `DashboardMessageKey`, so a typo in a
  config is a compile error rather than a raw key in the UI. Select *option*
  labels stay `string` because their values are runtime data, not messages.
- Escaping the generic renderer is done through `overrides.renderField`, keyed
  by dotted field path (`name.en`). Renderers receive `control`, `formState`,
  and `register`; they are mounted as real elements and may use hooks.
- A field's `control` owns its value semantics. `switch` uses `Controller`, not
  `register`, because React Hook Form omits unchecked checkboxes from the
  submitted payload, which would let a `.default()` silently reactivate the
  record. Optional number and UUID fields normalize `''` and `null` to
  `undefined` through `field-coercions`.
- Migrating an entity means deleting its `src/features/<entity>` directory
  entirely, including its API and hooks, and pointing any remaining cross-feature
  reader at `createEntityHooks(<config>).useEntities(...)`.

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

`src/shared/auth/` is the single owner of the dashboard role vocabulary. There
are exactly two roles, `platform_admin` and `branch_manager`, and exactly two
areas, `admin` and `manager`, declared once as `as const` arrays with derived
union types and `isDashboardRole()` / `isDashboardArea()` guards. The
role-to-area mapping is a single `satisfies Record<DashboardRole, DashboardArea>`
table, so adding or renaming a role is a compile error rather than a silent
mis-routing.

Authorization is role plus branch scope, not granular permissions. A platform
admin is unscoped and reads across every branch; a branch manager is pinned to
the `branchId` carried on the claim. This mirrors the Laravel `DashboardActor`,
where the same two facts decide every branch-scoped query.

```text
src/shared/auth/
├── claim-cookie.ts          # Cookie name, safe for client and edge imports
├── enums/                   # Roles and areas: as const + derived union + guard
├── types/                   # One type per file: claim, actor type
├── rbac.ts                  # Pure predicates: areaForRole, canAccessArea, hasAnyRole
├── resolve-request-claim.ts # Server-component cookie read + verify (imports next/headers)
├── route-guard.ts           # (claim, pathname) -> allow / redirect decision
├── verify-dashboard-claim.ts# JWT verification. Never imported by client code
└── index.ts                 # Barrel. Deliberately excludes verify-dashboard-claim
```

Rules:

- `auth` is a leaf. It imports nothing from `routes/`, `entities/`, or
  `components/`. `routes/` and `entities/` may import from `auth`; never the
  reverse.
- No module outside `src/shared/auth/` may spell a role literal.
  `scripts/check-architecture.mjs` fails the build when one appears; roles are
  imported instead.
- The barrel excludes `verify-dashboard-claim.ts` because it reads
  `process.env['DASHBOARD_SESSION_SECRET']` and pulls `jose` into the bundle.
  Client components import the cookie name from the barrel and never the
  verifier.
- Server components read the claim through `resolveRequestClaim()` rather than
  re-implementing the cookie read. Middleware has already rejected a missing or
  invalid claim, but callers still treat `null` as not-found instead of assuming
  a session exists.
- A claim is rejected unless it is internally consistent: a branch manager must
  carry the branch it is scoped to and a platform admin must not. This closes
  the window where an unscoped claim would degrade into a manager with no
  branch filter.
- Navigation items declare `roles?: readonly DashboardRole[]`. An omitted list
  means every role. It is a visibility hint only, never an authorization gate,
  and it must mirror the entity's `access.read` — otherwise the sidebar links a
  route that returns `notFound()`.
- Route layouts derive the role from the verified claim instead of asserting it
  from the URL. `middleware.ts` still runs first, so a mismatch ends in
  `notFound()` rather than a shell rendering with a forged role.

## Entity access

Each entity config declares per-operation access as an explicit area tuple:

```ts
access: {
  create: { areas: [adminArea] },
  edit: { areas: [adminArea, managerArea] },
  read: { areas: [adminArea, managerArea] },
}
```

Every operation spells out its areas instead of spreading the full area list, so
a newly added area is denied by default and cannot leak access through a config
that happens to predate it. A missing `create` or `edit` means the operation is
unavailable; there is no `delete` gate because no delete surface exists in the
frontend, and branch deletion stays server-enforced only.

Custom form components receive the verified claim through
`EntityFormProps.claim`. A workflow that exposes an area-wide choice must bind
it to the claim when one is present: `WalkInBookingForm` hides the manual branch
selector for a branch manager and binds the input to their `branchId`, leaving
the selector selectable for a platform admin.

Middleware is a UX and routing boundary, not API authorization. Laravel verifies
the authenticated actor and branch scope on every dashboard endpoint; the
dashboard only mirrors that decision so the user is not shown surfaces that will
return `403`.

## Errors and notifications

The central client parses the backend envelope and normalizes errors. Query and
mutation hooks publish normalized 401, 403, validation, conflict, and server
failures through the global toast engine. Route errors use `app/error.tsx` and
root failures use `app/global-error.tsx`; errors must never be ignored.

## Localization

Both dictionaries live in `src/shared/i18n/messages.ts`, keyed by section, with
`ar` typed as `typeof en` so a missing or misspelled Arabic key is a compile
error. Components read a message through `useDashboardTranslation()`. Code below
the component tree — the API client, `DashboardApiError`, entity configs — cannot
call a hook, so it resolves messages through `src/shared/i18n/translate.ts`,
which takes the locale from the same cookie the request sends.

Rules:

- A user-facing string is a `DashboardMessageKey`, never an inline literal. The
  entity config contracts enforce this for `messages.*`, column and detail
  labels, field labels, and filter labels, so a bad key fails the build.
- Brand names, entity names, and status *values* returned by the API are data,
  not messages, and are rendered as-is.
- A fallback title for a record with no name uses a field the record already
  has, not an untranslated placeholder.
- An entity config that needs to show an error passes `overrides.onMutationError`,
  which receives the translator from the engine rather than reaching for i18n
  itself.

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
- The architecture script rejects role literals outside `src/shared/auth/`, so
  a role rename cannot leave a stale comparison behind.
- `npx tsc --noEmit`, lint, dashboard tests, and the backend dashboard feature
  tests are mandatory PR/commit gates. Each feature is validated before the
  next feature begins.

When a rule cannot be mechanically enforced, the exception must be local,
documented with a justification, and approved in review; blanket disables are
not allowed.
