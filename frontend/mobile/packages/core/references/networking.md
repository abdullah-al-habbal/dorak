---
nodeid: mobile.packages.core.references.networking
parentnode: mobile.packages.core
childnodes: []
codeanchors:
  - frontend/mobile/packages/core/lib/
---

Referenced from [`../AGENTS.md`](../AGENTS.md).

## 3. ApiClient

```dart
ApiClient(
  baseUrl: ConfigProvider.config.apiBaseV1Url,
  localeResolver: () => 'en',
  tokenProvider: tokenStorage.read,   // omit -> AuthInterceptor is NOT installed
  enableLogging: kDebugMode,
  maxRetries: 3,
);
```

Verbs: `get` `post` `put` `patch` `delete` `getPaginated` `getRawPaginated`.
Each parser-typed except `delete`. Timeouts: connect 15 s, receive 30 s.
`getRawPaginated` returns the parsed page **plus** the raw wire items/meta —
the `FeedCache` write path (parsed DTOs have no `toJson`).

Interceptor order: `Locale → [Auth] → [Logging] → Retry`.
`RetryInterceptor` covers `GET/PUT/PATCH/DELETE` on timeouts, connection
errors, 429 and 5xx, with `500ms * 2^(attempt-1)` backoff. **`POST` is never
retried.**

### Envelope

```json
{"success": bool, "statusCode": int, "code": "SUCCESS", "message": "...",
 "timestamp": "...", "data": ..., "meta": {...}, "errors": {...}}
```

`_parse` returns `body['data']`. `data`/`meta`/`errors` are **omitted** when
empty, not null — a parser must tolerate `null`. `getPaginated` reads
`meta.pagination`.

### Exceptions

| Type | Trigger | Carries |
|---|---|---|
| `ValidationException` | `code == 'VALIDATION_FAILED'` | `errors` as `Map<String, List<String>>`, `errorsFor(field)` |
| `NetworkException` | no response body | `type` (`DioExceptionType`), `retryable`; `statusCode` 0, `code` `NETWORK_ERROR` |
| `ApiException` | everything else | `statusCode`, `code`, `message`; `isUnauthorized`/`isForbidden`/`isNotFound`/`isRateLimited`/`isServerError` |

Non-envelope payload → `ApiException(status, 'INVALID_RESPONSE')`.

