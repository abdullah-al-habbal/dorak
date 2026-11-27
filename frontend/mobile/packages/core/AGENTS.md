---
nodeid: mobile.packages.core
parentnode: mobile.guide
childnodes: []
codeanchors:
  - frontend/mobile/packages/core/lib/
---

# `packages/core`

The shared infrastructure of every app: HTTP, environment config, device storage, session lifecycle, wire models
and exceptions. No UI, screens or user-visible strings. Adds to the [mobile guide](../../AGENTS.md). How it fits
together: [core architecture](../../references/root/core-architecture.md). Consumers import only
`package:core/core.dart`.

## Dependencies

- Third-party packages, and `localization` only if a task needs it. Never `design_system`, a feature package or
  app code: if core needs something from an app, invert it with a callback or an abstract contract.
- Pure `bloc` is allowed ([ADR 0001](../../docs/architecture/decisions/0001-bloc-in-core.md)); `flutter_bloc` and
  `go_router` are not.
- Adding a package needs a reason recorded here or in `docs/`. Recorded reasons:

| Package | Reason | Seam that keeps tests off the plugin |
| --- | --- | --- |
| `url_launcher` | opens the public legal pages and the web owner registration (owner approval 2026-11-18, T8.4) | `ExternalLinkOpener` |
| `package_info_plus` | supplies `app_version` for feedback (same approval) | `AppInfoProvider` |
| `flutter_local_notifications` | shows a push received while the app is open (owner request 2026-11-24) | `ForegroundNotificationPresenter` |

## Rules

- No `Dio` outside `api.client.dart`. A `DioException` never reaches a caller. The one exposed transport type is
  `NetworkException.type`; don't widen it (so a test that builds the exception needs `dio` as a dev dependency).
- One `<domain>.endpoints.dart` per backend module, exported only through `endpoints.barrel.dart`
  (`test/endpoints_barrel_test.dart` guards it). Never inline a path, and add only routes the backend has.
- Never hardcode a base URL; it comes from `.env`. Tests pass an explicit `baseUrl`.
- A new public type is reachable from `lib/core.dart` through its section barrel.
- A store is an abstract class plus its implementation in one file. A new persisted value extends
  `AppPreferences` (not secret) or `TokenStorage` (secret).
- A new backend domain gets its own endpoints and repository files.
- `.screen.dart`, `.token.dart` and `.theme.dart` aren't allowed here.
- State is pure `bloc`, never `ChangeNotifier`. Follow the
  [state contract](../../docs/state-management/conventions.md); pagination uses `Paged<T>`
  ([pagination](../../docs/state-management/pagination.md)).

## Behaviour to know

- Without a `tokenProvider`, `ApiClient` installs no auth interceptor and requests go out unauthenticated without
  an error.
- The feed cache stores the wire payload, not parsed DTOs, because response DTOs have no `toJson`;
  `getRawPaginated` is its write path.
- The cache store enforces no expiry. The consumer checks `FeedCacheEntry.isStale`, so stale data stays usable
  offline.

## Tests

New public behaviour needs a test in `test/`. Use the fakes in `test/helpers/`; don't add a mocking package.
