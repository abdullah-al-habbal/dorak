Referenced from [`../SKILL.md`](../SKILL.md).

## Pre-existing attributes (Laravel 11-12, still valid)

### Eloquent — `Illuminate\Database\Eloquent\Attributes\`
- `#[ObservedBy(PostObserver::class)]` — attach observers
- `#[ScopedBy(ActiveScope::class)]` — global scopes
- `#[CollectedBy(PostCollection::class)]` — custom collection
- `#[UseFactory(PostFactory::class)]` — bind factory
- `#[UseEloquentBuilder(PostBuilder::class)]` — custom query builder
- `#[UsePolicy(PostPolicy::class)]` — bind policy
- `#[UseResource(PostResource::class)]` / `#[UseResourceCollection(PostCollection::class)]` — resource binding
- `#[Boot]` / `#[Initialize]` on methods — lifecycle hooks
- `#[Scope]` on methods — local scopes

```php
use Illuminate\Database\Eloquent\Attributes\Initialize;

class Post extends Model
{
    #[Initialize]
    public function setDefaults(): void
    {
        $this->attributes['status'] ??= 'draft';
    }
}
```

### Queue — `Illuminate\Queue\Attributes\`
- `#[DeleteWhenMissingModels]` — delete job when bound model is gone
- `#[WithoutRelations]` — strip relations before serializing

### Container / DI — parameter attributes, `Illuminate\Container\Attributes\`
- `#[CurrentUser]` / `#[Authenticated('web')]` — inject authenticated user
- `#[Config('services.stripe.secret')]` — config value
- `#[Auth('api')]` — auth guard
- `#[Cache('redis')]` — cache store
- `#[DB('analytics')]` / `#[Database('legacy_mysql')]` — DB connection (alias)
- `#[Log('payments')]` — log channel
- `#[Storage('s3')]` — filesystem disk
- `#[Tag('notification.channels')]` — tagged services
- `#[RouteParameter('invoice')]` — route parameter
- `#[Give(StripePaymentGateway::class)]` — specific implementation
- `#[Context('request_id')]` — context repository value

```php
use Illuminate\Container\Attributes\Config;

class PaymentService
{
    public function __construct(
        #[Config('services.stripe.secret')] private string $stripeSecret,
    ) {}
}
```

### Container / service registration — class-level, `Illuminate\Container\Attributes\`
- `#[Bind]` — new instance per resolution
- `#[Singleton]` — one shared instance
- `#[Scoped]` — one instance per request scope

