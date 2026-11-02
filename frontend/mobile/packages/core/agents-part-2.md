---
nodeid: mobile.packages.core.part-2
parentnode: mobile.packages.core
childnodes: []
codeanchors:
  - frontend/mobile/packages/core/lib/
---

Part 2 of 3 · [AGENTS.md — packages/core](AGENTS.md) · [Previous](AGENTS.md) · [Next](agents-part-3.md)

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
