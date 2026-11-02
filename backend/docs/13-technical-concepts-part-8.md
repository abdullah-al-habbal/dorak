---
nodeid: backend.13-technical-concepts.part-8
parentnode: backend.13-technical-concepts.group-1
childnodes: []
codeanchors:
  - backend/modules/
---

Part 8 of 20 · [13 — Technical Concepts: Mandatory Reference](13-technical-concepts.md) · [Previous](13-technical-concepts-part-7.md) · [Next](13-technical-concepts-part-9.md)

### Concept 08: Retry with Exponential Backoff

**Rule:** When a request fails, retrying instantly can hammer a struggling server. Exponential backoff waits longer before each retry — 1s, 2s, 4s, 8s.

**Flutter Implementation:**

```dart
// Dio interceptor with retry package
import 'package:retry/retry.dart';

class RetryInterceptor extends Interceptor {
  final _retry = Retry(
    maxAttempts: 5,
    delayFactor: const Duration(seconds: 1),
    maxDelay: const Duration(seconds: 30),
    retryIf: (e) => e is TimeoutException || (e is DioException && e.type == DioExceptionType.connectionTimeout),
  );

  @override
  void onError(DioException err, ErrorInterceptorHandler handler) async {
    if (err.response?.statusCode == 429 || err.response?.statusCode == 503) {
      // Rate limited or server overloaded — retry with backoff
      try {
        final response = await _retry.retry(
          () => _dio.fetch(err.requestOptions),
        );
        handler.resolve(response);
        return;
      } catch (_) {}
    }
    handler.next(err);
  }
}
```

**Laravel Implementation (Queue Jobs):**

```php
final class ProcessFaceAnalysisJob implements ShouldQueue
{
    public int $tries = 5;
    public int $backoff = 8; // seconds: 2, 4, 8, 16, 32

    public function backoff(): array
    {
        return [2, 4, 8, 16, 32];
    }
}
```

---
