---
nodeid: skills.backend.laravel-native-abstractions.references.requests-validation-authorization
parentnode: skills.backend.laravel-native-abstractions
childnodes:
  - skills.backend.laravel-native-abstractions.references.requests-validation-authorization.part-2
  - skills.backend.laravel-native-abstractions.references.requests-validation-authorization.part-3
  - skills.backend.laravel-native-abstractions.references.requests-validation-authorization.part-4
codeanchors:
  - backend/modules/
---

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

## Continued in

- [Part 2: Form Requests and rule objects](requests-validation-authorization-part-2.md)
- [Part 3: Route model binding](requests-validation-authorization-part-3.md)
- [Part 4: Authorization](requests-validation-authorization-part-4.md)
