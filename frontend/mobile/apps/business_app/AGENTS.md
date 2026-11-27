---
codeanchors:
  - frontend/mobile/apps/business_app/lib/
---

# `apps/business_app`

The app for branch accounts and brand owners. Adds to the [mobile guide](../../AGENTS.md).
Features: [feature index](docs/feature-index.md).

## Rules

- Dependencies: `core`, `design_system`, `localization` and `feature_error_feedback`, plus third-party packages.
  Import a package through its barrel, never its `src/`, and never import another app.
- `dio` and other types that only fakes need are dev dependencies; don't import them from `lib/`.
- `lib/main.dart` only boots; `lib/app.dart` holds the root widget and all wiring (constructor injection, no
  container or service locator). Routes are in `lib/src/core/navigation/`, features in `lib/src/features/`.

## Behaviour to know

- Sign-in offers "Branch account" and "Brand owner". An owner signs in as a client, and `AppRoleProvider` keeps
  the role so the app reopens in the right shell. Owner routes are under `/owner` and use the `/owner/*` API.
  A branch account never reaches them, and an owner never reaches the branch shell.
- Owner registration happens on the website.
- The router refreshes through core's `StaffSessionRefresh`, so logout and token expiry redirect at once.
- The inbox is the notification feed; there is no two-way messaging.
- Services come back in one language, so the edit form asks for both names again.

Scope decisions: [ADR 0002](../../../../docs/adr/0002-mvp-scope-deferrals.md).
