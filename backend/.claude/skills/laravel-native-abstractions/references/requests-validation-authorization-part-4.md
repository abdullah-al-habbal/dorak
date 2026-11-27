---
codeanchors:
  - backend/modules/
---

Part 4 of 4 · [Requests, Validation, Routing, Authorization](requests-validation-authorization.md) · [Previous](requests-validation-authorization-part-3.md)

## Authorization

**Repo state (verified 2026-08-22):** there are zero `*Policy.php` classes, zero `Gate::`
calls, zero `abort(403)` calls, and no `role:` / `permission:` middleware anywhere in
`modules/`, even though `spatie/laravel-permission` is installed. Ownership is enforced
implicitly by scoping queries.

That means: when you touch an endpoint that needs an access rule, you are introducing the
first policy, not following an existing pattern. Do it properly rather than copying the
scoping trick into another file.

Preferred, in order:

```php
// 1. Route-level, declarative.
Route::get('/bookings/{booking}', ShowBookingAction::class)->can('view', 'booking');

// 2. Inside the Action, before building the Command.
Gate::authorize('update', $booking);

// 3. Form Request gate, when the rule depends on validated input.
public function authorize(): bool
{
    return Gate::allows('update', $this->route('booking'));
}
```

`Route::can($ability, $models = [])` is verified present (`Routing/Route.php:1107`); it applies
the `can` middleware.

Avoid:

```php
if ($booking->client_id !== auth()->id()) {
    abort(403);
}
```

It duplicates policy logic, is easy to forget in the next endpoint, and drifts as rules
evolve.

Guidelines:

- One policy class per model, registered by convention or explicitly in a module provider.
- Keep authentication (Sanctum: who are you) separate from authorization (policy: may you).
- Spatie roles/permissions answer "what kind of actor is this"; a policy answers "may this
  actor act on this record". Use both — a role check alone does not scope to a record.
- Test the rejection path, not only the happy path.
- `Gate::authorize()` throws `AuthorizationException` → 403 through the module's error
  handling; do not catch it to return a custom shape unless `api-response-standard` requires
  it.
