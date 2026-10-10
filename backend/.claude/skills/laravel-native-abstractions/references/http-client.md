# HTTP Client

Use `Illuminate\Support\Facades\Http` rather than cURL, stream contexts, or bare Guzzle.
The client already owns retries, timeouts, pooling, error mapping, and test fakes.

---

## Composing a request

```php
$response = Http::baseUrl(config('services.payment.base_url'))
    ->acceptJson()
    ->withToken($accessToken)
    ->timeout(10)
    ->connectTimeout(3)
    ->retry(3, 200, throw: false)
    ->post('/payments', $payload);
```

Signature (verified): `retry(array|int $times, Closure|int $sleepMilliseconds = 0, ?callable $when = null, bool $throw = true)`.
The named argument `throw:` is correct.

Always set `timeout()` **and** `connectTimeout()`. The default timeout is 30 seconds — long
enough to hold a queue worker or an API request hostage.

---

## Failure handling

Pick one contract and be explicit:

```php
// 1. Throw on 4xx/5xx — right when any failure is exceptional.
$data = Http::acceptJson()->retry(3, 200)->get($url)->throw()->json();

// 2. Inspect explicitly — right when specific statuses are business outcomes.
$response = Http::acceptJson()->get($url);

if ($response->notFound()) {
    return null;
}

$response->throw();
```

Available: `successful()`, `failed()`, `clientError()`, `serverError()`, `status()`,
`notFound()`, `unauthorized()`, `forbidden()`, `throw()`, `throwIf($condition)`,
`throwUnless()`, `onError($callback)`.

`retry()` with `throw: false` returns the last response instead of raising
`RequestException` — pair it with an explicit check, never with silence.

---

## Retry policy

Do not retry blindly.

- Retry transient failures only: connection errors, timeouts, `429`, `502`, `503`, `504`.
- Never auto-retry a non-idempotent write without an idempotency key. See
  `docs/13_technical-concepts.md` for this repo's idempotency-key convention.
- Use the `$when` callback to scope retries:

```php
->retry(3, 200, fn (Throwable $e) => $e instanceof ConnectionException, throw: false)
```

- Pass an array for a backoff schedule: `->retry([100, 500, 2000])`.
- A hand-written `for ($attempt = 0; ...)` loop around an HTTP call is a defect unless the
  policy genuinely exceeds what `retry()` can express.

---

## Parallel requests

```php
$responses = Http::pool(fn (Pool $pool) => [
    $pool->as('branches')->get("{$base}/branches"),
    $pool->as('services')->get("{$base}/services"),
]);

$branches = $responses['branches']->json();
```

Use `pool()` for independent requests. Do not pool dependent calls, and do not pool a request
whose result decides whether the next one should be made at all.

For non-HTTP parallel work see `references/concurrency-collections-helpers.md`.

---

## Integration boundaries

Wrap each external service in one module-level client/gateway class, resolved from the
container. Actions and Handlers depend on that contract, not on URL assembly, auth headers,
error mapping, and timeouts copied into every call site.

```php
final class PaymentGateway
{
    public function __construct(private readonly PendingRequest $client) {}

    public function charge(ChargeCommand $command): ChargeResult { /* ... */ }
}
```

Bind the configured `PendingRequest` once in the module service provider (`Http::baseUrl(...)`
plus headers, timeouts, retry policy), and inject it. `Http::macro()` is the alternative when
the policy is shared across several small call sites.

Keep credentials in `modules/Core/Config/*.php` reading `env()` with no default — see
`AGENTS.md`. Never inline a base URL or key in business code.

---

## Testing

```php
Http::fake([
    'payment.test/*' => Http::response(['id' => 'pay_1'], 201),
]);

// ... exercise the Action ...

Http::assertSent(fn (Request $request) => $request->url() === 'https://payment.test/payments'
    && $request->data()['amount'] === 5000);
```

- `Http::fake()` in every test that would otherwise leave the process. Live third-party calls
  in the suite are forbidden.
- `Http::preventStrayRequests()` in the base `TestCase` makes an unfaked call fail loudly
  instead of hitting the network.
- Assertions: `assertSent()`, `assertNotSent()`, `assertSentCount()`, `assertNothingSent()`,
  `assertSentInOrder()`.
- Fake a sequence for retry paths: `Http::fakeSequence()->pushStatus(500)->pushStatus(200)`.
