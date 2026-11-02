---
nodeid: mobile.packages.core
parentnode: mobile.guide
childnodes:
  - mobile.packages.core.changelog
  - mobile.packages.core.claude
  - mobile.packages.core.readme
codeanchors:
  - frontend/mobile/packages/core/lib/
---

# AGENTS.md — `packages/core`

Infrastructure package: HTTP, config, storage, session, DTOs, exceptions.
No UI, no strings.

Parent: [`../../AGENTS.md`](../../AGENTS.md) · Rules: [`CLAUDE.md`](./CLAUDE.md)

---

## 1. Layout

```
lib/core.dart                            root barrel — 4 section barrels
lib/src/
  config/
    app_config.entity.dart               AppConfig {apiBaseUrl, apiBaseV1Url}
    config.provider.dart                 ConfigProvider.config, from dotenv
    config.barrel.dart
  network/
    api.client.dart                      ApiClient + JsonParser<T> + RawPaginated<T>
    api_response.dto.dart                ApiResponse<T> envelope
    paginated_data.dto.dart              PaginatedData<T>
    pagination_meta.dto.dart             PaginationMeta
    network.barrel.dart
    dto/                                 auth_response · client · onboarding_config · booking* · branch_detail · floor_plan · floor_chair · token_response · service_history · history_barber · history_branch · history_catalog_item · history_media · face_photo · face_analysis_result · avatar · universe_preference · catalog_price_range · catalog_item · barber_profile · barber_service · currency
    endpoints/                           app · auth · booking · branch · explore · history · currency (+ endpoints.barrel.dart, the single export path for every endpoint file; guarded by test/endpoints_barrel_test.dart)
    exceptions/                          api · network · validation
    interceptors/                        auth · locale · logging · retry
    repositories/                        auth · onboarding_config · explore · booking · branch · history · face_profile · profile · service_catalog · currency
  session/
    auth_status.entity.dart              AuthStatus enum
    auth.bloc.dart                       AuthBloc — login / register / verify / resend
    auth.event.dart                      AuthEvent (Login/Register/Verify/Resend/Ack)
    auth.state.dart                      AuthState
    auth_signal.entity.dart              AuthSignal
    session.bloc.dart                    SessionBloc — restore / logout / signals
    session.event.dart                   SessionEvent (restore / logout / 401 / guard / ack / authenticated)
    session.state.dart                   SessionState
    session_signal.entity.dart           SessionSignal
    session.barrel.dart
  storage/
    token.storage.dart                   TokenStorage + SecureTokenStorage
    preferences.storage.dart             AppPreferences + SharedAppPreferences
    feed_cache.storage.dart              FeedCache + SharedFeedCache (feed cache strategy)
    feed_cache_entry.entity.dart         FeedCacheEntry value object + feedCacheTtl
    storage.barrel.dart
```

Empty directories left from scaffolding: `src/models/{branch,currency,user}/`,
`src/utils/{formatters,validators}/`. Nothing lives there yet.

Consumers import **only** `package:core/core.dart`.

## 2. Config

```dart
ConfigProvider.config.apiBaseV1Url   // throws StateError if dotenv not loaded
```

Keys, per app `.env` (gitignored; `.env.example` committed):

```
API_BASE_URL=https://dev-dorak-backend.io/api
API_BASE_URL_V1=https://dev-dorak-backend.io/api/v1
```

There is no local-dev profile — no `localhost` or `10.0.2.2` anywhere.

## More

| Topic | Read |
| --- | --- |
| ApiClient, envelope, exceptions (§3) | [`references/networking.md`](references/networking.md) |
| Repositories (§4) | [`references/repositories.md`](references/repositories.md) |
| Session blocs (§5) | [`references/session.md`](references/session.md) |
| Storage + adding things (§6–7) | [`references/storage.md`](references/storage.md) |
| Gotchas (§8) | [`references/gotchas.md`](references/gotchas.md) |
| Tests (§9) | [`references/tests.md`](references/tests.md) |

## 10. Commands

```bash
cd frontend/mobile
dart run melos run build     # after a DTO change
dart run melos run analyze
dart run melos run test
```
