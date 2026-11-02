---
nodeid: mobile.apps.client-app.references.tests
parentnode: mobile.apps.client-app
childnodes: []
codeanchors:
  - frontend/mobile/apps/client_app/lib/
---

Referenced from [`../AGENTS.md`](../AGENTS.md).

## 8. Tests — 145, in `test/`

| File | Covers |
|---|---|
| `widget_test.dart` | real `DorakApp` bootstrap: splash → gate → auth entry |
| `app_gate_test.dart` | all six gate branches |
| `auth_flow_test.dart` | login, validation, sign-up → verify, OTP pass/fail, skip, resend cooldown |
| `locale_switcher_flow_test.dart` | shared `LocaleSwitcher` on auth entry / login / sign-up / verify: visible, EN↔AR round trip, RTL flip |
| `onboarding_skip_test.dart` | Skip vs Don't show again vs Cancel, full four-step walk, empty back-stack |
| `password_recovery_bloc_test.dart` | the recovery transitions, the enumeration mitigation, the carried code, the rejected code |
| `password_recovery_flow_test.dart` | 011→014 route walk; unregistered email still advances; rejected code routes back to 012; 014 drops the stack |
| `onboarding_config_bloc_test.dart` | config load, retry after failure, locale refetch |
| `session_expired_test.dart` | 401 mid-session → session-expired signal → auth redirect |
| `helpers/fakes.dart` | `routerHarness()`, `buildRouter()` (takes `session` + `auth` + `passwordChange` + `discovery` + `bookings` + `branchDetail` + `history` + `stylistProfile` + `onBarberSelected`), `sessionPair()` (builds a matched `AuthBloc`+`SessionBloc` **plus the app-layer coordinator forward**), `InMemoryTokenStorage`, `InMemoryAppPreferences`, `FakeAuthRepository`, `FakeOnboardingConfigRepository`, `FakeExploreRepository` (+ `testBranchDetail` + `testBarberProfile` + `getBarberDetail`), `FakeCurrencyRepository` (+ `testCurrency`), `FakeBranchRepository` (+ `testFloorPlan`), `FakeBookingRepository` (cancel + `createBooking`), `FakeHistoryRepository` (+ `testServiceHistory`/`testHistoryPage`), `FakeLocationProvider`, `FakeFeedCache`, `testPosition`/`testBranch`/`testBranchPage`, `fakeDiscoveryBloc()`/`fakeBookingBloc()`/`fakeBranchDetailBloc()`/`fakeHistoryBloc()`/`fakeStylistProfileBloc`, `unauthorized()`, `offline()` |
| `discovery_bloc_test.dart` | location gating, cache fresh/stale/offline, universe/filter reload + evict, load-more append + failure, refresh, retry |
| `change_password_bloc_test.dart` | submit success + payload, 422 wrong-current, transport failure |
| `change_password_flow_test.dart` | profile entry → success → Done pop, mismatch blocks, server field error |
| `booking_bloc_test.dart` | start/filter/cancel/load-more/retry over `Paged<BookingDto>` |
| `booking_flow_test.dart` | tab list, past filter, confirm-cancel reload, dialog dismiss, retry-after-offline |
| `branch_detail_bloc_test.dart` | detail + plan parallel load, plan-failure tolerance, chair/services/time selection, submit guard, 409 conflict, submit no-op without chair |
| `history_bloc_test.dart` | history start/fail/load-more append/retry, rebook success (slot + id) + failure + ack reset |
| `history_flow_test.dart` | profile header + history list, empty state, picker-cancel no-op, rebook success → Bookings + reset |
| `face_analysis_bloc_test.dart` | start empty/curated/failed, catalog-failure tolerance, scan → pending, upload failure, check-again load / stay-pending / retry |
| `avatar_bloc_test.dart` | upload publishes the returned url, upload failure keeps the previous avatar + error |
| `face_analysis_flow_test.dart` | empty card + scan action, scan → pending → analysis result + curated card, picker-cancel no-op, avatar upload |
| `stylist_profile_bloc_test.dart` | detail + currencies parallel load, currency failure tolerated, retry |
| `stylist_profile_flow_test.dart` | avatar header, stats row, services list, branch-detail barbers → tappable rows |

Conventions:

- **Set a phone viewport** for onboarding/auth tests:
  `tester.view.physicalSize = const Size(1290, 2796)`,
  `devicePixelRatio = 3.0`, `addTearDown(tester.view.reset)`. The 800×600
  default overflows these screens.
- `routerHarness(AppRouter)` drives flows through a real go_router
  `MaterialApp.router` without booting `DorakApp` or its network calls.
- `dotenv.loadFromString(...)` in `setUpAll` for anything that constructs
  `ApiClient`.
- **The test fallback font is not IBM Plex** — it renders every glyph at full em
  width, roughly double. A `RenderFlex overflowed` in a test is not proof of a
  device bug.

