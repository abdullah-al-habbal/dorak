---
nodeid: mobile.core.interceptors.part-2
parentnode: mobile.core.interceptors
childnodes: []
codeanchors:
  - frontend/mobile/packages/core/lib/
---

Part 2 of 2 · [Interceptors & API Infrastructure](interceptors.md) · [Previous](interceptors.md)

401/403 are **not** retryable, so `RetryInterceptor` never re-dispatches them —
no infinite-loop risk. The interceptor always calls `handler.next(err)`; the
error still surfaces as an `ApiException` at the call site, so existing
call-site error handling is unchanged.

`ApiClient.unauthorizedStream` fires at most **once per burst**: concurrent
401/403 responses collapse into a single emission (`reportUnauthorized` sets a
flag), and the app layer calls `resetUnauthorizedSignal()` after handling.
This is what prevents double navigations and repeated token clears under load.

## LoggingInterceptor

`kDebugMode`-gated request/response logging. No-op in release builds.
Logs method, path, status, latency.

## RetryInterceptor

Retries idempotent requests (`GET`, `PUT`, `PATCH`, `DELETE`) on transient
failures: connect/send/receive timeouts, connection errors, HTTP 429, and
any 5xx. `POST` is never retried.

* `maxRetries` (default 3), exponential backoff `500ms * 2^(attempt-1)`.
* Per-request attempt count stored in `requestOptions.extra['retry_count']`.
* `RetryInterceptor.isRetryable(err)` is public so `ApiClient._guard` can
  flag `NetworkException.retryable` consistently.

## Endpoints

Domain-split endpoint declarations (`lib/src/network/endpoints/*.endpoints.dart`)
instead of monolithic route files. Export via `endpoints.barrel.dart`.

## DTO Mapping

`*.dto.dart` classes own JSON parsing and MUST use `build_runner` +
`json_serializable` codegen (see the [mobile guide](../../AGENTS.md#rules)). Examples: `OnboardingConfigDto`
(`{hero_image_url, season, locale}`), `PaginationMeta`, `ApiResponse<T>`,
`PaginatedData<T>`. Parsers are injected into verbs as `JsonParser<T>`;
DTOs stay free of Dio/transport types. Regenerate after edits:
`melos run build`.
