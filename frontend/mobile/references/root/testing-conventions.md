Referenced from [`../../AGENTS.md`](../../AGENTS.md).

## 12. Testing conventions

**288 tests pass** (121 in `core`, 153 in `client_app`, 14 in `design_system` —
the Track 12 state-component suite plus the `locale_switcher` tests — plus 1
smoke test each in `business_app`, `stylist_app`, `localization`,
`feature_floor_plan`). Re-baselined via `dart run melos run verify`
2026-09-14.

| File | Covers |
|---|---|
| `core/test/api_client_test.dart` | envelope parse, verbs, pagination, exception mapping |
| `core/test/auth_repository_test.dart` | request bodies incl. `password_confirmation`, `PATCH /client/password`, 401/422 mapping |
| `core/test/auth_bloc_test.dart` | login/register/verify success + failure, resend swallow, auth signal ack |
| `core/test/session_bloc_test.dart` | all four `restore()` branches, `SessionAuthenticated`, logout, signals |
| `core/test/auth_repository_test.dart` | request bodies incl. `password_confirmation`, 401/422 mapping |
| `core/test/unauthorized_signal_test.dart` | 401/403 burst emission + reset on the `unauthorizedStream` |
| `core/test/storage_test.dart` | preference round-trip + defaults |
| `core/test/feed_cache_test.dart` | feed-cache key bucketing, round-trip, evict/clear, staleness, corrupt payload |
| `client_app/test/widget_test.dart` | real `DorakApp` bootstrap: splash → gate → auth entry |
| `client_app/test/app_gate_test.dart` | all six gate branches |
| `client_app/test/auth_flow_test.dart` | login, validation, sign-up → verify, OTP, skip, resend cooldown |
| `client_app/test/onboarding_skip_test.dart` | Skip vs Don't show again vs Cancel, full walk, empty back-stack |
| `client_app/test/locale_switcher_flow_test.dart` | shared `LocaleSwitcher` on auth entry / login / sign-up / verify: visible, EN↔AR round trip, RTL flip |
| `client_app/test/session_expired_test.dart` | 401 mid-session → session-expired signal → auth redirect |
| `client_app/test/discovery_bloc_test.dart` | location gating, cache fresh/stale/offline, universe/filter reload + evict, load-more append + failure, refresh, retry |
| `client_app/test/change_password_bloc_test.dart` | submit success + payload, 422 wrong-current, transport failure |
| `client_app/test/change_password_flow_test.dart` | profile entry → success → Done pop, mismatch blocks, server field error |
| `client_app/test/booking_bloc_test.dart` | start/filter/cancel/load-more/retry over `Paged<BookingDto>` |
| `client_app/test/booking_flow_test.dart` | tab list, past filter, confirm-cancel reload, dialog dismiss, retry-after-offline |
| `client_app/test/branch_detail_bloc_test.dart` | detail + plan parallel load, plan-failure tolerance, chair/services/time selection, submit guard, 409 conflict |
| `core/test/booking_repository_test.dart` | nested parsing, status/page params, cancel route + verb, `createBooking` UTC slot format + 409 |
| `core/test/branch_repository_test.dart` | `getFloorPlan` parsing (available/occupied chairs) + path |
| `core/test/explore_repository_test.dart` | branch parsing, `getBranchDetail`, `getBarberDetail` (barber + services parse), raw payload for cache writes, query params incl. `page` |
| `core/test/history_repository_test.dart` | `ServiceHistoryDto` nested parse (translations map), history page params, rebook route/verb + UTC slot + BookingDto parse |
| `core/test/face_profile_repository_test.dart` | upload multipart FormData fields + `is_primary`, recommendations parse (latest-first, nullable rec ids, `face_profile` embed) |
| `core/test/profile_repository_test.dart` | `updateProfile` PATCH partial payload + `preferred_universe`, uploadAvatar multipart, updatePreferredUniverse, catalog parse (price_range + face_shapes, missing price_range tolerated) |
| `client_app/test/history_bloc_test.dart` | history start/fail/load-more append/retry, rebook success (slot + id) + failure + ack reset |
| `client_app/test/history_flow_test.dart` | profile header + history list, empty state, picker-cancel no-op, rebook success → Bookings + reset |
| `client_app/test/face_analysis_bloc_test.dart` | start empty/curated/failed, catalog-failure tolerance, scan → pending, upload failure, check-again load/stay-pending/retry |
| `client_app/test/avatar_bloc_test.dart` | upload publishes url, upload failure keeps previous avatar + error |
| `client_app/test/face_analysis_flow_test.dart` | empty card + scan action, scan → pending → result, picker-cancel no-op, avatar upload |
| `core/test/currency_repository_test.dart` | currency parse |
| `core/test/explore_repository_test.dart` | branch parsing, `getBranchDetail`, `getBarberDetail` (barber + services parse), raw payload for cache writes, query params incl. `page` |
| `client_app/test/stylist_profile_bloc_test.dart` | detail + currencies parallel load, currency failure tolerated, retry |
| `client_app/test/stylist_profile_flow_test.dart` | avatar header, stats row, services list, branch-detail barbers → tappable rows |

Rules:

- Use the fakes in `client_app/test/helpers/fakes.dart` and
  `core/test/helpers/{fake_dio,fake_auth}.dart`. Never hit a real plugin or a
  real network.
- **Construct `Bloc`s inside the `testWidgets` body, never in `setUp`.** A bloc
  built in `setUp` lives outside the FakeAsync zone, so its event stream never
  delivers and `await session.ready` hangs. Build it in the body (or in a
  helper called from the body), then drive it with `pump`/`pumpAndSettle`.
- `DorakApp` takes optional `tokenStorage` and `authRepository` **purely as
  test seams**. Leave them null in production.
- `routerHarness(AppRouter)` builds a real `go_router`-driven
  `MaterialApp.router` so flows can be driven without booting `DorakApp`.
- **Set a phone viewport** for onboarding/auth widget tests:
  `tester.view.physicalSize = const Size(1290, 2796)` with
  `devicePixelRatio = 3.0` and `addTearDown(tester.view.reset)`. The 800×600
  default overflows these screens.
- The test fallback font renders every glyph at full em width, roughly **twice**
  IBM Plex. A `RenderFlex overflowed` in a test is not proof of a device bug —
  measure before "fixing" layout.

---

