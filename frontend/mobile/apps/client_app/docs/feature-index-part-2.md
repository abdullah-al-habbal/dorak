---
codeanchors:
  - frontend/mobile/apps/client_app/lib/
---

Part 2 of 4 · [Feature Index — Dorak Client App (apps/client_app)](feature-index.md) · [Previous](feature-index.md) · [Next](feature-index-part-3.md)

### Password Recovery — Stitch 011–014
- `lib/src/features/auth/password_recovery.bloc.dart` (+ `.event.dart`, `.state.dart`) and `recovery_signal.entity.dart` — app-layer bloc over the core `AuthRepository`; carries `email` and `code` across the four steps.
- `forgot_password.screen.dart` (011) + `widgets/forgot_password_content.widget.dart` — email field, `AuthValidators.email`, "Send Code".
- `recovery_otp.screen.dart` (012) + `widgets/recovery_otp_content.widget.dart` — six reused `OtpInputField`s, masked destination, 60 s resend cooldown. **Cannot validate the code** — no such endpoint exists.
- `create_new_password.screen.dart` (013) + `widgets/create_new_password_content.widget.dart` — new + confirm password. **This is where a rejected code surfaces**, with a "Re-enter code" action back to 012.
- `password_reset_success.screen.dart` (014) — a thin `StatusView` wrapper; the first production consumer of that Track 12 component. Exits with `router.go`, so the recovery stack is dropped.
- Constraints and the enumeration mitigation: `docs/authentication/password-recovery.md`.

### Bootstrap & Navigation
- `lib/main.dart` — binding init, dotenv, `SharedAppPreferences.create()`, then `DorakApp`.
- `lib/app.dart` — builds secure storage → `ApiClient` (with `tokenProvider`) → `DioAuthRepository` → `AuthBloc` → `SessionBloc(repository, storage)` → `OnboardingConfigBloc` → `LocaleBloc`; starts `session.ready` unawaited so restore overlaps the splash; subscribes the auth stream → `SessionAuthenticated`, the unauthorized stream → `UnauthorizedDetected`, and locale → config reload. Test seams: `tokenStorage`, `authRepository`.
- `lib/src/core/navigation/app.router.dart` — `AppRouter` (go_router); three stream listeners (session + auth + recovery) re-run the redirect and react to `SessionSignal` / `AuthSignal` / `RecoverySignal` before acknowledging; `router.go(AppRoutes.home)` clears the stack.
- `lib/src/core/navigation/app_routes.entity.dart` — `AppRoutes` path constants.
- `lib/src/core/navigation/app_gate.entity.dart` — `AppGate.resolve`, a pure function called from `AppRouter._leaveSplash` once `session.ready` completes (session first, onboarding flag second). It is deliberately **not** in the redirect — the splash must hold for its animation.

### Home

### Tests
- `test/widget_test.dart` — real `DorakApp` bootstrap: splash → gate → auth entry.
- `test/app_gate_test.dart` — all six launch-gate branches.
- `test/auth_flow_test.dart` — login, validation, sign-up → verify, OTP success/failure, skip, resend cooldown.
- `test/password_recovery_bloc_test.dart` — recovery transitions, the enumeration mitigation, the carried code, the rejected code.
- `test/password_recovery_flow_test.dart` — 011→014 route walk; an unregistered email still advances; a rejected code routes back to 012; 014 drops the stack.
- `test/onboarding_config_bloc_test.dart` — config load, retry after a failure, locale refetch.
- `test/locale_switcher_flow_test.dart` — shared `LocaleSwitcher` across the auth screens, EN↔AR round trip, RTL flip.
- `test/session_expired_test.dart` — 401 mid-session → session-expired signal → auth redirect.
- `test/onboarding_skip_test.dart` — Skip vs Don't show again vs Cancel, full four-step walk, empty back-stack.
- `test/helpers/fakes.dart` — router harness + in-memory storage/preferences/auth fakes.

### Discovery Feed — Stitch 016 (CL-09)
- `lib/src/features/discovery/discovery.{bloc,event,state}.dart` + `discovery_filter.entity.dart` — location-gated feed over `Paged<BranchDto>` + `FeedCache` (stale label, revalidate, evict-on-filter-change).
- `lib/src/features/discovery/discovery.screen.dart` — location-required / error / loading / empty / feed states, pull-to-refresh, infinite scroll.
- `lib/src/features/discovery/widgets/discovery_filter_bar.widget.dart` — universe segmented control, available-now switch, price range, rating slider.
- `lib/src/features/discovery/widgets/discovery_result_card.widget.dart` — rank/compatibility/distance badges, Book Now, optional View Details.
- `test/discovery_bloc_test.dart` — 15 bloc cases; `test/helpers/fakes.dart` gains `FakeExploreRepository`, `FakeLocationProvider`, `FakeFeedCache`, `testPosition`/`testBranch`/`testBranchPage`, `fakeDiscoveryBloc`.

### Authenticated Password Change — Track 17
- `lib/src/features/auth/change_password.{bloc,event,state}.dart` — submit over `AuthRepository.changePassword`, `succeeded` flag, typed error.
- `lib/src/features/auth/change_password.screen.dart` + `widgets/change_password_content.widget.dart` — `AuthShell` form (current/new/confirm), `AuthValidators`, 422 field errors in the banner, success `StatusView` with Done pop.
- Entered from the Profile tab (`SecondaryButton`), nested `/profile/password` route.
- `test/change_password_bloc_test.dart` + `test/change_password_flow_test.dart`.
