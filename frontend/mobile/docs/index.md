---
nodeid: mobile.docs
parentnode: mobile.guide
childnodes:
  - mobile.architecture
  - mobile.authentication.auth-flow
  - mobile.authentication.password-recovery
  - mobile.core.background-tasks
  - mobile.core.exceptions
  - mobile.core.interceptors
  - mobile.core.networking
  - mobile.core.result-state
  - mobile.core.session
  - mobile.core.storage
  - mobile.design-system
  - mobile.feature-index
  - mobile.flows.app-launch
  - mobile.flows.guest-access
  - mobile.flows.onboarding
  - mobile.future-features.per-page.per-page
  - mobile.navigation.guards
  - mobile.navigation.routes
  - mobile.realtime.reverb
  - mobile.runtime.app-lifecycle
  - mobile.screens.authentication.create-new-password
  - mobile.screens.authentication.forgot-password
  - mobile.screens.authentication.password-reset-success
  - mobile.screens.authentication.recovery-otp
  - mobile.state-management
codeanchors:
  - frontend/mobile/apps/
  - frontend/mobile/packages/
---

# Dorak Mobile — AI Execution Index

Repository routes: [mobile guide](../AGENTS.md) · [documentation graph](../../../docs/index.md).

Repository: `dorak-mobile`
Architecture contract: `/CLAUDE.md`
Visual source of truth: Stitch Project `9427872355342200736`
Documentation root: `/docs`

## 1. Purpose

This directory is the implementation contract for the Dorak Flutter monorepo.

Documentation is divided into two categories:

1. Engineering documentation — architecture, runtime behavior, state management, networking, storage, security, testing, and AI-agent execution rules.
2. Design documentation — normalized design tokens, reusable components, application states, flows, and screen specifications derived from Stitch.

Stitch defines the visual design.

The engineering documentation defines how that design must be implemented.

The two sources must remain separate and must not silently replace each other.

---

## 2. AI Agent Execution Protocol

Before modifying code, an AI agent MUST:

0. Read `/AGENTS.md` — the entry point (feature inventory, backend contract,
   non-obvious decisions, testing conventions).
1. Read `/CLAUDE.md`.
2. Read this file.
3. Identify the current Track and Task.
4. Read only the documentation required by the current Track.
5. Inspect the existing implementation before creating new files.
6. Preserve package and dependency boundaries.
7. Follow the repository file-naming taxonomy.
8. Implement only the current Task.
9. Run the required verification commands.
10. Update relevant documentation and status before advancing.

An AI agent MUST NOT:

* Skip required architectural documentation.
* Invent undocumented backend APIs or contracts.
* Duplicate existing components or infrastructure.
* Introduce a second networking architecture.
* Introduce a second state-management architecture.
* Put business logic inside design-system components.
* Import application code into shared packages.
* Implement future Tracks prematurely.
* Mark work complete without verification.

---

## 3. Repository Architecture

```text
frontend/mobile/
├── apps/
│   ├── client_app/
│   ├── business_app/
│   └── stylist_app/
│
├── packages/
│   ├── design_system/
│   ├── localization/
│   └── core/
│
├── docs/
└── CLAUDE.md
```

Dependency direction:

```text
apps/*
   ↓
feature packages
   ↓
core / design_system / localization
```

Rules:

* `design_system` MUST NOT depend on `core`.
* `localization` MUST remain independently reusable.
* `core` MUST NOT depend on application-specific code.
* Feature packages may depend on `design_system`, `core`, and `localization`.
* Applications may depend on the permitted local packages.
* Shared packages MUST NOT import executable application code.

See:

* `docs/architecture/system_overview.md`
* `docs/architecture/dependency_rules.md`
* `docs/architecture/package_boundaries.md`

---

## 4. Documentation Map

The repository-wide [documentation graph](../../../docs/index.md) catalogs every
maintained Markdown document by folder. This mobile index routes into the
current topic docs; it does not list planned files that have not been created.

- Architecture: [coding conventions](architecture/coding-conventions.md) and [architecture decisions](architecture/decisions/0001-bloc-in-core.md).
- Core runtime: [networking](core/networking.md), [session](core/session.md), [runtime lifecycle](runtime/app-lifecycle.md), and [realtime](realtime/reverb.md).
- State and navigation: [state management](state-management/index.md), [routes](navigation/routes.md), and [guards](navigation/guards.md).
- Product flows: [authentication](authentication/auth-flow.md), [onboarding](flows/onboarding.md), and [guest access](flows/guest-access.md).
- Design: [design-system index](design-system/index.md) and [password recovery screen](screens/authentication/forgot-password.md).
- Verification: use the package and app verification instructions in [mobile guide](../AGENTS.md).

---

# 5. Implementation Tracks

Only open tracks are listed; completed tracks (00–04, 06–08, 10, 16) are shipped and recorded in git history and [the feature index](feature-index.md). Track 05 keeps its single open item.

## Track 05 — Storage

**Status:** `DONE` (2026-09-02)

Objectives:

* Secure credentials/tokens. — `DONE` (`TokenStorage` / `SecureTokenStorage`)
* Local preferences. — `DONE` (`AppPreferences` / `SharedAppPreferences`)
* Onboarding persistence. — `DONE`
* `"Don't show again"` persistence. — `DONE`
* Profile-completion persistence. — `PENDING` (blocked on Track 17)
* Cache strategy. — `DONE` (`FeedCache` / `SharedFeedCache`, raw-wire-payload
  feed cache; bounded keys = universe + lat/long 3-dp + 5 km radius bucket +
  per_page; read-time staleness via `FeedCacheEntry.isStale`,
  `feedCacheTtl` = 30 min; explicit `evict`/`clear`; corrupt payloads → null).

**Evidence.** 11 tests in `packages/core/test/feed_cache_test.dart` (key
bucketing incl. same-neighbourhood sharing; write/read/evict/clear round-trips;
staleness against an injected clock; corrupt payload → null). Full gate:
`dart run melos run verify` exit 0, **168 tests** (core 72 → 83,
re-baselined 2026-09-02).

The cache's first consumer is the Discovery feed — the wait-for-consumer caveat that kept this track
deferred is resolved: the envelope it stores was derived from the real backend
`/explore/branches` contract, and Discovery (Track 18) reads it.

Documentation: `docs/core/storage.md`.

Implementation target:

```text
packages/core
```

---

## Track 09 — State Management

**Status:** `IN_PROGRESS`

> Locked (Phase 2): **Pure Bloc** (`flutter_bloc`) is the canonical
> state-management architecture. UI emits events; `Bloc` owns business state;
> UI renders from state. No Riverpod, Provider or GetIt. `ChangeNotifier` is
> **not** a target pattern — the session layer runs on `SessionBloc` (pure
> `bloc`) with `ApiClient.unauthorizedStream` for the 401 signal, and the
> pagination notifiers were deleted. This track still owes the async / loading /
> empty / error / refresh conventions.

Objectives:

* Establish one canonical state-management architecture. — `DONE` (Pure Bloc;
  `packages/core` uses pure `bloc` by ADR 0001, `apps/*` use `flutter_bloc`)
* Async state conventions. — `DONE` (`docs/state-management/conventions.md`,
  `async-state.md`)
* Loading. — `DONE` (`isLoading` = reading, `isSubmitting` = user-initiated
  write; initial ≠ loading ≠ empty)
* Success. — `DONE` (absence of `error` plus data; no separate flag)
* Empty. — `DONE` (`success && data.isEmpty`, never rendered as an error)
* Error. — `DONE`. Failures land in `state.error`; blocs never rethrow; the app
  localizes via `AuthError.from` — a backend `message` is never rendered.
* Refresh. — `DONE` (`docs/state-management/refresh.md`; first-load vs
  load-more vs refresh, and refresh vs filter change)
* Pagination. — `IN_PROGRESS`. The `Paged<T>` contract exists in
  `packages/core/lib/src/network/` and is covered by `paged_test.dart`, but
  **no feature consumes it yet**. It stays `IN_PROGRESS` until Discovery (016)
  validates it. If 016 finds it does not fit, change `Paged<T>` rather than
  working around it.
* Background operations. — `PENDING`, deliberately undocumented. Nothing in
  Dorak performs background work; writing a contract for it would be fiction.
  `docs/state-management/background_operations.md` stays empty until Track 13
  creates something real.

Also carried by this track:

* `ApiClient.getPaginated` now validates the envelope like every other verb — a
  `success: false` body no longer returns a successful empty page.
* `OnboardingConfigBloc` retry guard fixed: a failed config load can be retried
  for the same locale.
* `LocaleBloc` keeps `Bloc<LocaleEvent, Locale>` under the documented
  single-value-state exemption (`conventions.md` §1a), now covered by tests.
* `bloc_concurrency` is **deliberately not a dependency** — the concurrency
  convention is written down; the package arrives with its first real consumer
  (`restartable()` for Discovery's search field).

Implementation targets:

```text
apps/*
packages/feature_*
```

---

## Track 11 — Navigation

**Status:** `IN_PROGRESS`

Objectives:

* Route definitions. — `DONE`. go_router route table in
  `app.router.dart` (`AppRouter`) + `app_routes.entity.dart`. Navigator 1.0
  and `.navigator.dart` coordinators were **removed in Phase 2**.
* Nested navigation. — `PENDING`
* Authentication guards. — `PARTIAL`. The launch gate (`AppGate.resolve`,
  installed as the router redirect) guards entry into the app; there are no
  per-route guards.
* Guest guards. — `PENDING`
* Profile-completion guards. — `PENDING` (blocked on Track 17)
* Deep links. — `PENDING`
* Notification-driven navigation. — `PENDING`

Documentation: `docs/navigation/routes.md`, `docs/navigation/guards.md`.

Implementation target:

```text
apps/*/src/core/navigation/
```

---

## Track 12 — Global UI States

**Status:** `IN_PROGRESS` — the state components exist and are tested
(`StatusView`, `AppLoader`, `ShimmerBox`, `StatusBanner`), but only
`StatusBanner` has production consumers today. The track stays `IN_PROGRESS`
until Discovery 016 consumes the other three; if 016 finds a component does
not fit, change the component, do not work around it.

Objectives:

Implement reusable:

* Full-page loading. — `DONE` (`AppLoader.page()` — `docs/design-system/components/loading/fullscreen.md`)
* Inline loading. — `DONE` (`AppLoader.inline()` — `docs/design-system/components/loading/inline.md`)
* Button loading. — `DONE` (`PrimaryButton.isLoading` — was already implemented and used by every auth form; the earlier `PENDING` status was a recording error. `SecondaryButton` deliberately has no `isLoading` — no consumer needs it)
* Shimmer. — `DONE` (`ShimmerBox`, hand-rolled, no package — `docs/design-system/components/shimmer/text.md`)
* Empty. — `DONE` (`StatusView` — `docs/design-system/states/empty.md`)
* Error. — `DONE` (`StatusView` full-page, `StatusBanner` inline; `AuthError.from` stays in the app — `docs/design-system/states/network-error.md`)
* Offline. — `DONE` (presentation variant of error; no connectivity package — `docs/design-system/states/offline.md`)
* Retry. — `DONE` (an action on `StatusView`/`StatusBanner`, not a widget — `docs/design-system/states/retry.md`)
* Session expired. — `DONE` (401/403 on an authenticated request →
  `ApiClient.unauthorizedStream` → `SessionBloc.add(UnauthorizedDetected())` →
  auth entry)
* Authentication required. — `DONE` (guest action adds `RequireAuthentication`
  → auth entry pushed on top; mechanism tested, **nothing in production
  dispatches it yet** — first producer will be Discovery 016)
* Permission required. — `PENDING` **deferred deliberately**: no permission
  mechanism exists in the workspace (no `permission_handler`, `geolocator`, or
  `connectivity_plus`) and there is no consumer. Ownership is open between
  Tracks 13/14 ;
  016's location-permission needs will trigger it. Do not build a permission
  visual without a mechanism.

Implementation targets:

```text
packages/core     # ApiClient.unauthorizedStream + SessionBloc signals
apps/*            # AppRouter listener redirects to /auth on sessionExpired
packages/design_system
```


---

## Track 13 — File & Media Infrastructure

**Status:** `PENDING`

Objectives:

* Image/file selection.
* Validation.
* MIME validation.
* Size validation.
* Upload progress.
* Cancellation.
* Background upload.
* Background success/failure.
* Retry.
* Notification integration.

Implementation targets:

```text
packages/core
packages/design_system
```

---

## Track 14 — Notifications & Deep Links

**Status:** `PENDING`

Objectives:

* Notification abstraction.
* Notification permission behavior.
* Upload success/failure notifications.
* Notification actions.
* Deep-link resolution.
* In-app result reconciliation.

Implementation targets:

```text
packages/core
apps/*
```

---

## Track 15 — Shared Design-System Components

**Status:** `PENDING`

Implementation order:

```text
Buttons
↓
Inputs
↓
App Bars
↓
Navigation
↓
Tabs
↓
List Items
↓
Cards
↓
Chips
↓
Dialogs
↓
Bottom Sheets
↓
Feedback
↓
Loading
↓
Shimmer
↓
Avatars
↓
File / Media UI
↓
Global States
```

Every implemented component MUST map to its corresponding Markdown specification and Stitch source.

---

## Track 17 — Profile Completion

**Status:** `PENDING`

Implementation order:

```text
Complete Profile
↓
Basic Information
↓
Profile Photo
↓
Preferences
↓
Review
↓
Completion
```

The behaviors MUST distinguish:

```text
Skip
≠
Don't show again
```

---

## Track 18 — Feature Modules

**Status:** `PENDING`

Implement feature packages according to the approved product backlog and PRD.

---

## Track 19 — Business Screens

**Status:** `PENDING`

Business screens MUST consume existing:

* Design-system components.
* Core contracts.
* Navigation.
* State management.
* Repositories.
* Localization.
* Error handling.

Business screens MUST NOT recreate shared infrastructure.

---

## Track 20 — Testing & Quality Gates

**Status:** `PENDING`

Required baseline:

```bash
flutter analyze
flutter test
```

Depending on the Track:

* Unit tests.
* Widget tests.
* Golden tests.
* Integration tests.
* Architecture/dependency tests.

---

## Track 21 — Final Architecture Audit

**Status:** `PENDING`

Verify:

* `CLAUDE.md` compliance.
* Dependency boundaries.
* File naming taxonomy.
* Duplicate components.
* Error handling.
* State management.
* Security.
* Localization.
* Testing.
* Documentation consistency.
* Stitch-to-Flutter traceability.

---

# 6. Current Execution Point

`IN_PROGRESS`: 09, 11, 12. `PENDING`: 13, 14, 15, 17–21. See each track below.

---

# 7. Completion Rule

A Track is complete only when:

1. Required implementation exists.
2. Required documentation exists.
3. Required tests exist.
4. Required verification commands pass.
5. No known architectural violation remains.
6. The Track status is updated here.

The next Track MUST NOT begin until the current Track is complete.

---

# 8. Stitch Traceability Rule

For every Stitch-derived design:

```text
Stitch Screen
    ↓
docs/stitch/exports/<screen>/
    ↓
Normalized Markdown Specification
    ↓
Flutter Component / Screen
```

The raw Stitch export is evidence.

The Markdown specification is the implementation contract.

The Flutter code is the implementation.

Do not treat Stitch-generated HTML as production Flutter code.

---

# 9. Documentation Status Convention

Use these statuses consistently:

* `PENDING`
* `IN_PROGRESS`
* `BLOCKED`
* `REVIEW`
* `VERIFIED`
* `COMPLETE`

A task MUST NOT be marked `COMPLETE` without verification evidence.

---

# 10. Current Rule

Work on exactly one Track and one Task at a time.

Read only the context required for the current Task.

Do not load or modify unrelated business features while working on foundation infrastructure.
