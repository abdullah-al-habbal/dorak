---
codeanchors:
  - backend/modules/
---

Part 3 of 3 · [HTTP Client](http-client.md) · [Previous](http-client-part-2.md)

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
