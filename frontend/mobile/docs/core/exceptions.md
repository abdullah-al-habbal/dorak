---
nodeid: mobile.core.exceptions
parentnode: mobile.docs
childnodes: []
codeanchors:
  - frontend/mobile/packages/core/lib/
---

# Exceptions

Status: `DONE`

## Purpose

Single application exception taxonomy in `packages/core/lib/src/network/exceptions/`.

## ApiException

Base error raised whenever the backend envelope reports `success: false` or
a non-2xx status. Carries the backend `code` and HTTP `statusCode`.

```dart
class ApiException implements Exception {
  final int statusCode;
  final String code;
  final String message;
}
```

Convenience predicates: `isUnauthorized`, `isForbidden`, `isNotFound`,
`isRateLimited`, `isServerError`.

## ValidationException

`422 VALIDATION_FAILED` responses. Holds field-level errors keyed by field
name:

```dart
class ValidationException extends ApiException {
  final Map<String, List<String>> errors;
  List<String>? errorsFor(String field);
}
```

## NetworkException

Transport failures (timeout, connection refused, offline, DNS) after the
retry interceptor has exhausted its attempts. `retryable` mirrors
`RetryInterceptor.isRetryable` so callers know whether retrying later is
worthwhile.

```dart
class NetworkException extends ApiException {
  final DioExceptionType type;
  final bool retryable;
  // statusCode 0, code 'NETWORK_ERROR'
}
```

## Mapping Rules

* `ApiClient._guard`: an HTTP response with a JSON object body →
  `ApiException`/`ValidationException`; **no response** (timeout, offline, DNS,
  cancel) → `NetworkException`.
* Any other response body (HTML, text, a list, empty), on success or failure →
  `ApiException(realStatus, 'INVALID_RESPONSE')`. A proxy 502 is a server
  failure, never "no connection".
* UI: only `NetworkException` may say there is no connection.
* `DioException` of any type never escapes `ApiClient`.

## Verification

Covered by `packages/core/test/api_client_test.dart` (422, 404, invalid
payload, transport error), `test/session_retention_test.dart` (non-envelope
statuses) and `test/retry_interceptor_test.dart`.
