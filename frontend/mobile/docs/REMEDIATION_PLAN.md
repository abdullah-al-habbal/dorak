# Architectural Debt Remediation Plan

## Completed: UDF, framework decoupling, and value-state foundations

- `BookingRefreshCubit` now emits a value state and its `refresh` method
  returns `Future<void>`.
- Booking detail and tracker screens render the cubit's state reactively.
- Locale logic imports `Locale` from `dart:ui`.
- Non-value states use `Equatable`; state-owned collections are defensively
  frozen.

## Completed: route lifecycle refactor

`DorakApp` now owns only `AuthBloc`, `SessionBloc`, and `LocaleBloc`; it retains
the root transport and session coordination subscriptions needed by those
states. Feature state is created by `BlocProvider` at its owning route,
stateful-shell branch, or leaf route and is disposed with that route.

- Password recovery is a `ShellRoute` with one shared
  `PasswordRecoveryBloc`; recovery screens use route-local `BlocListener`s to
  react to its one-shot signals.
- Persistent tab features are scoped to their corresponding
  `StatefulShellBranch`; detail, review, profile-completion, and password-change
  flows are leaf-scoped.
- The global redirect no longer reads `BookingBloc.state`; review navigation is
  independent of booking-tab state.
- Route tests retain injectable feature blocs only as test seams. Production
  routing creates feature blocs locally from repository implementations.
