---
codeanchors:
  - frontend/mobile/apps/client_app/lib/
---

# `apps/client_app`

The customer app, and the reference for bootstrap, navigation and tests. Adds to the [mobile guide](../../AGENTS.md).
Features: [feature index](docs/feature-index.md).

## Rules

- Dependencies: `core`, `design_system`, `localization` and `feature_error_feedback`, plus third-party packages.
  Import a package through its barrel, never its `src/`, and never import another app.
- `dio` and other types that only fakes need are dev dependencies; don't import them from `lib/`.
- `lib/main.dart` only boots; `lib/app.dart` holds the root widget and all wiring (constructor injection, no
  container or service locator). Routes are in `lib/src/core/navigation/`, features in `lib/src/features/`.
- Screens receive callbacks and render. They don't call repositories, touch storage or choose the next route.
- Flow logic is in `AppRouter`: it listens to the session and auth blocs, reacts to their signals and
  acknowledges each one.
- `LocaleBloc` uses `Locale` as its state and has no state file. That is a sanctioned exception in the
  [state contract](../../docs/state-management/conventions.md).
- Feature widgets such as `AuthTextField` and `OtpInputField` stay in the app until another app needs them or
  Track 15 specifies them.
- Local assets only for critical UI.
- `DorakApp`'s optional test parameters stay null in production.

Read [the decisions that are not in the code](references/decisions.md) before "simplifying" anything.

## Flows to keep

- Registration returns a signed-in token before the email is verified. Verification doesn't block use: the screen
  offers "Verify later", and only its resend button asks for another code.
- Logging in skips the onboarding tour; "Continue as Guest" is the way into it. "Skip for now" leaves
  `dontShowOnboarding` unset, so the tour returns on the next cold start; "Don't show again" and finishing the
  tour set it.
- Password recovery ends at Login, not Home. See
  [password recovery](../../docs/authentication/password-recovery.md).
