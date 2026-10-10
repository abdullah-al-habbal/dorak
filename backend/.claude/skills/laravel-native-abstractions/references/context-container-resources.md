# Context, Container, Storage, API Resources

---

## Context

`Illuminate\Support\Facades\Context` carries metadata through the whole execution lifecycle —
including across the queue boundary, via its `dehydrate()` / `hydrate()` mechanism.

```php
Context::add('request_uuid', $requestUuid);
Context::add('branch_id', $branch->getKey());
Context::addHidden('actor_email', $user->email);   // not written to logs
```

Then every log entry in that request **and in any job dispatched from it** carries the same
metadata, without threading it through constructors.

Useful methods (verified in `Log/Context/Repository.php`): `add()`, `addIf()`, `addHidden()`,
`remember()`, `push()`, `pop()`, `increment()`, `get()`, `only()`, `except()`, `forget()`,
`scope()`, `stackContains()`.

**How this fits this repo.** `Modules\Core\Services\LoggerService` is the canonical logging
entry point and `AssignRequestUuidMiddleware` + `LoggerService::enrichContext()` already attach
`request_uuid` to every log line — keep using it (see `logging-and-tracing`). Where `Context`
adds something the current setup does not: that middleware-set UUID does not follow a queued
job, but Context does. Prefer `Context::add()` for anything that must remain traceable after
the response, and let `LoggerService` keep owning message shape.

Do not paste the same `['branch_id' => ..., 'request_uuid' => ...]` array onto twenty log
calls. That is what Context is for.

Do not build a new logger wrapper around Laravel's channels — the project already has one, and
`config/logging.php` owns channels, formatters, and stack composition.

---

## Container and dependency injection

Never construct a container-managed dependency by hand in business code:

```php
// Avoid
$gateway = new StripePaymentGateway(config('services.stripe'));
```

```php
// Prefer — constructor injection, resolved by the container
public function __construct(
    private readonly PaymentGateway $gateway,
    private readonly LoggerService $logger,
) {}
```

Bind interfaces to implementations in the module's service provider. Use contextual binding
when two consumers need different implementations of the same contract.

Laravel 13 contextual attributes (verified in
`vendor/laravel/framework/src/Illuminate/Container/Attributes/`) replace many hand-written
bindings:

| Attribute | Injects |
|---|---|
| `#[Config('services.stripe.key')]` | A config value |
| `#[Auth]` / `#[Authenticated]` / `#[CurrentUser]` | Guard / authenticated user |
| `#[Cache('redis')]` | A cache store |
| `#[DB]` / `#[Database('mysql')]` | Connection |
| `#[Log('daily')]` | A log channel |
| `#[Storage('s3')]` | A filesystem disk |
| `#[RouteParameter('booking')]` | A route parameter |
| `#[Tag('reports')]` | All services tagged with a tag |
| `#[Give(StripeGateway::class)]` | A specific implementation for this parameter |
| `#[Bind(...)]` / `#[Singleton]` / `#[Scoped]` | Registration lifetime on the class |
| `#[Context('branch_id')]` | A Context value |

`laravel-attributes` is the authority for exact signatures and this repo's attribute-only
convention. Do not restate them here — read that skill.

Avoid `app(Foo::class)` and facades inside constructors; both hide the dependency graph and
make the class harder to test.

---

## Storage and uploads

Use the filesystem abstraction, never native file functions, for application-managed files.

```php
$path = Storage::disk('s3')->putFile("bookings/{$booking->getKey()}", $request->file('invoice'));

$path = Storage::disk('s3')->putFileAs("clients/{$client->getKey()}", $file, 'avatar.jpg');

// From the uploaded file itself
$path = $request->file('invoice')->store("bookings/{$booking->getKey()}", 's3');
```

Avoid:

```php
move_uploaded_file($tmp, storage_path('app/...'));
file_put_contents($path, $contents);
unlink($path);
```

- `putFile()` streams — it does not read the whole upload into memory.
- `exists()` / `missing()`, `delete()`, `copy()`, `move()`, `size()`, `mimeType()`,
  `lastModified()`, `readStream()` / `writeStream()` for large files.
- `temporaryUrl($path, now()->addMinutes(5))` for time-limited access on drivers that support
  it (S3 does; the local driver needs `Storage::buildTemporaryUrlsUsing()`). Never expose a
  permanent public URL for a file that requires authorization.
- Disk names and credentials belong in `modules/Core/Config/filesystems.php` reading `env()`
  with no default. Do not scatter bucket names or paths through Handlers.
- `Storage::fake('s3')` in tests, with `assertExists()` / `assertMissing()`.
- Image manipulation goes through `intervention/image` (already installed), not shell calls.

---

## API Resources

Use `JsonResource` conditional APIs to describe the response contract rather than hand-built
array conditionals.

```php
public function toArray(Request $request): array
{
    return [
        'id' => $this->id,
        'status' => $this->status,
        'customer' => ClientResource::make($this->whenLoaded('client')),
        'items_count' => $this->whenCounted('items'),
        'items_total' => $this->whenAggregated('items', 'price', 'sum'),
        'internal_note' => $this->when($request->user()?->isStaff() === true, $this->internal_note),
        'meta' => $this->mergeWhen($this->hasMeta(), fn () => ['meta' => $this->meta]),
    ];
}
```

Verified in `Http/Resources/ConditionallyLoadsAttributes.php`: `when()`, `whenNotNull()`,
`mergeWhen()`, `whenLoaded()`, `whenCounted()`, `whenAggregated($relationship, $column,
$aggregate)`, `whenExistsLoaded()`, `whenPivotLoaded()`, `whenAppended()`, `whenHas()`.

- `whenLoaded()` omits the key when the relation is not loaded — it does **not** trigger a lazy
  load. This is the correct pairing with deliberate eager loading.
- Never return a bare model or `toArray()` from an endpoint. The Resource is the public
  contract; the model is internal shape.
- Response envelope, status codes, and error keys are owned by `api-response-standard`
  (`ApiResponseBodyValueObject` + `ApiResponseTrait`). Resources shape `data`, nothing else.
- Bilingual fields go through Spatie Translatable — see `translation-conventions`.
