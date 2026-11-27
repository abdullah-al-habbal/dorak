---
codeanchors:
  - backend/modules/
---

Part 3 of 4 · [Requests, Validation, Routing, Authorization](requests-validation-authorization.md) · [Previous](requests-validation-authorization-part-2.md) · [Next](requests-validation-authorization-part-4.md)

## Route model binding

Avoid re-querying a model the route already identifies:

```php
// Avoid
Route::get('/bookings/{booking}', ShowBookingAction::class);

public function __invoke(string $booking): JsonResponse
{
    $model = BookingModel::query()->findOrFail($booking);
}
```

Prefer implicit binding:

```php
public function __invoke(BookingModel $booking): JsonResponse
{
    // resolved and 404'd by the router
}
```

Route-layer options belong at the route layer, not in the Action:

| Need | API |
|---|---|
| Bind by a non-primary key | `Route::get('/branches/{branch:slug}', ...)` or `getRouteKeyName()` |
| Include soft-deleted models | `->withTrashed()` |
| Child must belong to parent | `->scopeBindings()` or `{branch}/{chair:id}` |
| Custom resolution logic | `Route::bind()` / `resolveRouteBinding()` |

`scopeBindings()` replaces the `where('branch_id', $branch->id)->findOrFail($chair)` pattern
that appears across `modules/Branch/Http/Actions/Branch/*.php`.

**Scoped binding is not authorization.** It guarantees the child belongs to the parent in the
URL; it says nothing about whether the caller may act on that parent.

---
