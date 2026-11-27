---
codeanchors:
  - backend/modules/
---

Part 2 of 4 · [Context, Container, Storage, API Resources](context-container-resources.md) · [Previous](context-container-resources.md) · [Next](context-container-resources-part-3.md)

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
