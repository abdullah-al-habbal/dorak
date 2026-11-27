---
codeanchors:
  - frontend/mobile/apps/stylist_app/lib/
---

# `apps/stylist_app`

The app for stylists (the barber guard). Adds to the [mobile guide](../../AGENTS.md).
Features: [feature index](docs/feature-index.md).

## Rules

- Dependencies: `core`, `design_system`, `localization` and `feature_error_feedback`, plus third-party packages.
  Import a package through its barrel, never its `src/`, and never import another app.
- `dio` and other types that only fakes need are dev dependencies; don't import them from `lib/`.
- `lib/main.dart` only boots; `lib/app.dart` holds the root widget and all wiring (constructor injection, no
  container or service locator). Routes are in `lib/src/core/navigation/`, features in `lib/src/features/`.

## Behaviour to know

- A new stylist is `pending` until an admin activates them, and login is refused with `ACCOUNT_NOT_ACTIVE`.
- The token returned at sign-up reaches only the onboarding routes while pending, so it is **not** a session.
  `StylistSignUpBloc` keeps it in memory, the API client reads it before the stored session token, and leaving
  the flow drops it. Never write it to the token storage.
- The router refreshes through core's `StaffSessionRefresh`.
- The inbox is the notification feed.
- Services come back in one language, so the editor asks for both names again.

Scope decisions: [ADR 0002](../../../../docs/adr/0002-mvp-scope-deferrals.md).
