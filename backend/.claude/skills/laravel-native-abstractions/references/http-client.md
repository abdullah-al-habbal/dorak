---
nodeid: skills.backend.laravel-native-abstractions.references.http-client
parentnode: skills.backend.laravel-native-abstractions
childnodes:
  - skills.backend.laravel-native-abstractions.references.http-client.part-2
  - skills.backend.laravel-native-abstractions.references.http-client.part-3
codeanchors:
  - backend/modules/
---

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

## Continued in

- [Part 2: Retry policy](http-client-part-2.md)
- [Part 3: Integration boundaries](http-client-part-3.md)
