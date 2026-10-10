# Requests, Validation, Routing, Authorization

---

## Typed request accessors

Laravel normalizes input types for you. In Laravel 13 these live in
`Illuminate\Support\Traits\InteractsWithData`, pulled into `Request` via
`Http\Concerns\InteractsWithInput` (verified).

```php
$request->boolean('is_active');            // "1", "true", "on", "yes" → true
$request->integer('per_page', 15);
$request->float('price');
$request->string('email')->trim()->lower(); // Stringable
$request->str('name');                      // alias of string()
$request->date('starts_at');                // Carbon|null
$request->date('starts_at', 'Y-m-d', 'Asia/Riyadh');
$request->enum('status', BookingStatusEnum::class);
$request->enums('statuses', BookingStatusEnum::class);
$request->array('filters');
$request->collect('filters');               // Collection
$request->fluent('meta');                   // Fluent
$request->image('photo');                   // Laravel 13: Illuminate\Image\Image|null
```

Avoid the manual equivalents:

```php
// Avoid
$active = filter_var($request->input('is_active'), FILTER_VALIDATE_BOOLEAN);
$status = BookingStatusEnum::from($request->input('status'));
$date   = Carbon::parse($request->input('starts_at'));
```

`$request->enum()` returns `null` for an invalid value instead of throwing — validation is
still required. It is a coercion helper, not a guard.

The same trait is available on `Collection`, `Fluent`, and `ValidatedInput`, so
`$request->safe()->enum('status', BookingStatusEnum::class)` works after validation.

---

## Form Requests and rule objects

Validate at the boundary. In this repo that is the Form Request feeding an Action, which then
builds a Command/Query object — see `cqrs-pattern` and `10StrictBackendArchitecture`. Do not
re-validate inside Handlers.

Use semantic rules instead of assembled strings:

```php
use Illuminate\Validation\Rule;

public function rules(): array
{
    return [
        'status' => ['required', Rule::enum(BookingStatusEnum::class)],
        'branch_id' => ['required', 'uuid', Rule::exists('branches', 'id')],
        'email' => ['required', 'email', Rule::unique('clients', 'email')->ignore($this->client)],
        'discount_code' => ['nullable', 'string', Rule::excludeIf(fn (): bool => ! $this->boolean('has_discount'))],
        'items' => ['required', 'array', 'min:1'],
        'items.*.quantity' => ['required', 'integer', 'min:1'],
    ];
}
```

Useful rule builders: `Rule::enum()` (with `->only()` / `->except()`), `Rule::exists()`,
`Rule::unique()`, `Rule::in()`, `Rule::requiredIf()`, `Rule::prohibitedIf()`,
`Rule::excludeIf()`, `Rule::when()`, `Rule::forEach()`, `Rule::array()`, `Rule::date()`,
`Rule::file()`, `Rule::imageFile()`, `Rule::anyOf()`.

Do **not**:

- Query the database to check existence when `Rule::exists()` says it.
- Check uniqueness manually and then assume the write is safe — the unique index is the
  authority (see `references/eloquent-persistence.md`).
- Build `'in:'.implode(',', array_column(Enum::cases(), 'value'))` — that is `Rule::enum()`.
- Pass `$request->all()` into a model, Command, or Handler. Use `validated()`, `safe()`, or a
  DTO.

For conditional logic that rules cannot express, use `withValidator()` /
`$validator->sometimes(...)`, and `prepareForValidation()` for normalization before rules run.

Error shape is owned by `api-response-standard` + `ErrorCodeEnum`; messages by
`translation-conventions`.

---

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
