---
codeanchors:
  - frontend/mobile/packages/core/lib/
---

# Networking

Status: `DONE`

## Purpose

`packages/core` provides the single networking architecture for all Dorak apps. Apps must not introduce a second HTTP stack; every outbound request goes through `ApiClient`.

## Contracts

* Backend envelope (`Modules\Core\Helpers\ApiResponseTrait`):
  `{success, statusCode, code, message, timestamp, data, meta?, errors?}`.
* Success codes: `SUCCESS`, `CREATED`, `UPDATED`, `DELETED`.
* Error codes: `BAD_REQUEST`, `VALIDATION_FAILED`, `UNAUTHORIZED`, `FORBIDDEN`, `RESOURCE_NOT_FOUND`, `CONFLICT`, `UNPROCESSABLE_ENTITY`, `TOO_MANY_REQUESTS`, `SERVER_ERROR`.

## ApiClient

Thin typed wrapper over Dio (`lib/src/network/api.client.dart`). Construction:

```dart
final client = ApiClient(
  baseUrl: ConfigProvider.config.apiBaseV1Url,
  localeResolver: () => 'en',
  tokenProvider: () async => null,   // enables AuthInterceptor
  enableLogging: kDebugMode,
  maxRetries: 3,
);
```

`ApiClient` requires an explicit `baseUrl` — no hardcoded defaults. Resolve it
from the environment-backed `ConfigProvider` (see below). Timeouts: connect 15 s,
receive 30 s. Verbs: `get`, `post`, `put`, `patch` (parser-typed), `delete`,
`getPaginated`.

`ApiClient` never leaks raw `DioException`s. Transport failures become
`NetworkException`; envelope failures become `ApiException` /
`ValidationException` (see `core/exceptions.md`).

## Continued in

- [Part 2: Config & Base URL](networking-part-2.md)
- [Part 3: Pagination](networking-part-3.md)
