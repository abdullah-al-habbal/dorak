---
nodeid: backend.13-technical-concepts.part-4
parentnode: backend.13-technical-concepts.group-1
childnodes: []
codeanchors:
  - backend/modules/
---

Part 4 of 20 · [13 — Technical Concepts: Mandatory Reference](13-technical-concepts.md) · [Previous](13-technical-concepts-part-3.md) · [Next](13-technical-concepts-part-5.md)

**Flutter Implementation:**

```dart
// Dio interceptor — attach idempotency key to every write request
class IdempotencyInterceptor extends Interceptor {
  @override
  void onRequest(RequestOptions options, handler) {
    if (options.method != 'GET') {
      options.headers['Idempotency-Key'] = const Uuid().v4();
    }
    handler.next(options);
  }
}
```

---

### Concept 04: Soft vs Hard Delete

**Rule:** Prefer soft deletes in production.

| Aspect | Hard Delete | Soft Delete |
|--------|-------------|-------------|
| **What happens** | Row permanently removed from database | `deleted_at` timestamp set |
| **Recovery** | No history. No recovery. | Hidden from app. Recoverable. Auditable. |
| **Use When** | Rarely | Refunds, audits, "restore my account" requests, legal holds |

**Laravel Implementation:**

```php
use Illuminate\Database\Eloquent\SoftDeletes;

final class BarberModel extends Authenticatable
{
    use SoftDeletes;

    // Queries automatically exclude soft-deleted records
    // Restore: $barber->restore()
    // Force delete: $barber->forceDelete()
    // Check: $barber->trashed()
}
```

**Flutter Implementation:**

No special handling needed — the API simply doesn't return soft-deleted records. Admin panel has "trash" view with restore action.

---
