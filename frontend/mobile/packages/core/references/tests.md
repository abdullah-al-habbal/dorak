Referenced from [`../AGENTS.md`](../AGENTS.md).

## 9. Tests

`packages/core/test/` — 114 tests.

| File | Covers |
|---|---|
| `api_client_test.dart` | envelope parse, 422, 404, invalid payload, transport error, all verbs, pagination, raw paginated payload |
| `explore_repository_test.dart` | branch parsing, `getBranchDetail` (detail + barbers + services), `getBarberDetail` (barber + services parse), raw payload for cache writes, query params incl. `page` |
| `branch_repository_test.dart` | `getFloorPlan` parsing (available/occupied chairs + barber) + path |
| `booking_repository_test.dart` | nested parsing, status/page params, cancel route + verb, `createBooking` UTC slot format + 409 conflict |
| `history_repository_test.dart` | `ServiceHistoryDto` nested parse (translations map), history page params, rebook route/verb + UTC slot + BookingDto parse |
| `face_profile_repository_test.dart` | upload multipart FormData fields (`FormData.files` is `List<MapEntry<String, MultipartFile>>`) + `is_primary`, recommendations parse (latest-first, nullable rec ids, `face_profile` embed) |
| `profile_repository_test.dart` | `updateProfile` PATCH partial payload (`'name': ?name`) + `preferred_universe`, uploadAvatar multipart, updatePreferredUniverse, catalog parse (price_range + face_shapes, missing price_range tolerated) |
| `retry_interceptor_test.dart` | retry on 5xx, give-up, POST not retried |
| `auth_repository_test.dart` | request bodies incl. `password_confirmation`, no-`data` responses, `PATCH /client/password` + 422 field errors, 401/422 mapping |
| `auth_bloc_test.dart` | login/register/verify success + failure, resend swallow, `AuthSignalAcknowledged` |
| `session_bloc_test.dart` | all four `restore()` branches, `ready` idempotence, `SessionAuthenticated`, logout, global signal emission |
| `unauthorized_signal_test.dart` | 401/403 burst emission + reset, lifecycle routes, no-bearer, transport, 5xx |
| `storage_test.dart` | preference defaults + round-trip |
| `feed_cache_test.dart` | key bucketing (same-neighbourhood share, universe/radius/per_page split, far coords differ), write/read round-trip, evict/clear, staleness vs injected clock, corrupt payload → null |
| `onboarding_config_repository_test.dart` | as named |
| `currency_repository_test.dart` | currency parse |

Helpers: `test/helpers/fake_dio.dart` (interceptor-based fake, envelope
builders, `clientWith`), `test/helpers/fake_auth.dart` (`InMemoryTokenStorage`,
`InMemoryAppPreferences`, scriptable `FakeAuthRepository`, `unauthorized()`,
`offline()`). No mocking package — do not add one.
