---
nodeid: backend.13-technical-concepts.part-3
parentnode: backend.13-technical-concepts.group-1
childnodes: []
codeanchors:
  - backend/modules/
---

Part 3 of 20 · [13 — Technical Concepts: Mandatory Reference](13-technical-concepts.md) · [Previous](13-technical-concepts-part-2.md) · [Next](13-technical-concepts-part-4.md)

```dart
// Repository sends expectedVersion with every update
Future<void> updateProfile(String id, Map<String, dynamic> data, int expectedVersion) async {
  final response = await _dio.patch(
    '/barber/profile',
    data: {...data, 'expected_version': expectedVersion},
  );
  if (response.statusCode == 409) {
    throw StaleDataException(); // trigger refetch in BLoC
  }
}
```

---

### Concept 03: Idempotency Keys

> **Audit:** which other write endpoints need a key or a unique constraint (subscription assign, payouts, OTP send, uploads, saved filters), the proposed in-flight claim design and the client retry rules are in [booking concurrency, file 03](../../docs/booking-concurrency/03-idempotency-and-uniqueness.md). The cache sketch below has no in-flight lock and caches only success; it is not the pattern to copy.

**Rule:** Attach a unique ID to every write request. If that exact request gets sent twice (from a double-click, retry, or flaky network), the server recognizes the key it already processed and returns the **same result** instead of doing it again.

**Implementation (built for `POST /bookings` only, where the header is required; see feature-index BG-9; the cache sketch below is not used):**

```
POST /api/v1/bookings
Idempotency-Key: "7f3a-9c21-4b8e-af02"
{
  "chair_id": "chair-42",
  "start_time": "2026-07-25T10:00:00Z"
}
```

**Laravel Implementation:**

Middleware:
```php
final class IdempotencyKeyMiddleware
{
    public function handle(Request $request, Closure $next): Response
    {
        $key = $request->header('Idempotency-Key');
        if ($key) {
            $cached = Cache::get("idempotency:{$key}");
            if ($cached) {
                return response($cached['body'], $cached['status']);
            }
        }

        $response = $next($request);

        if ($key && $response->getStatusCode() < 400) {
            Cache::put("idempotency:{$key}", [
                'body' => $response->getContent(),
                'status' => $response->getStatusCode(),
            ], now()->addHours(24));
        }

        return $response;
    }
}
```
