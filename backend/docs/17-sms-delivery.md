---
nodeid: backend.17-sms-delivery
parentnode: backend.docs
childnodes: []
codeanchors:
  - backend/modules/Core/Services/Sms/
  - backend/modules/Core/Contracts/SmsSender.php
---

# 17 — SMS Delivery (Strategy + Factory)

> **Status:** Active. Introduced by audit gap G5.

## Pattern

- **Strategy contract:** `Modules\Core\Contracts\SmsSender::send(string $phone, string $message): void`. Feature code (e.g. `RequestPhoneOtpHandler`) depends only on this contract.
- **Factory:** `Modules\Core\Services\Sms\SmsSenderFactory` resolves the driver from `services.sms.driver` using `SmsDriverEnum`. `ApplicationServiceProvider` binds the contract to the factory. Unknown driver: `InvalidArgumentException('Unsupported SMS driver.')`.
- **Drivers:** `LogSmsSender` (`log`, local/testing; logs the code outside production) and `GenericHttpSmsSender` (`generic_http`).

## Adding a gateway

1. Add a case to `SmsDriverEnum`.
2. Add a `final` class implementing `SmsSender` under `Modules\Core\Services\Sms`.
3. Add one `match` arm in `SmsSenderFactory`, plus its `services.sms.*` config keys and `.env.example` entries.
4. Cover it with `Http::fake()` tests for success, gateway rejection and unreachable gateway. `SmsSenderArchitectureTest` enforces the layout.

## `generic_http` configuration

| Env | Meaning |
|---|---|
| `SMS_DRIVER` | `log` or `generic_http`. Production must use a real driver. |
| `SMS_HTTP_URL` | Required http(s) endpoint. |
| `SMS_HTTP_FORMAT` | `json` (default) or `form`. |
| `SMS_HTTP_HEADERS` | Single-line JSON object, e.g. `{"Authorization":"Bearer ..."}`. |
| `SMS_HTTP_PAYLOAD` | Single-line JSON object template; `{{phone}}` and `{{message}}` are replaced in string values only. Empty = `{"to","message"}`. |
| `SMS_HTTP_TIMEOUT` | Seconds, default 10 (connect timeout 3). |

## Production requirement (G5)

`SMS_DRIVER=generic_http` (with `SMS_HTTP_URL` and any `SMS_HTTP_HEADERS`) must be set in every production and staging environment. `backend/.env.example` defaults to `log` for local development only: with `log`, no SMS leaves the server, so client phone OTPs are never delivered and the code is written to the log. Verify after each deploy with `php artisan tinker` -> `config('services.sms.driver')` returning `generic_http`.

## Rules

- Throw `SmsDeliveryException` on a connection failure or any non-2xx response. Its message may carry the HTTP status only: never the phone, the SMS body or credentials.
- No automatic retries: a retried POST can deliver the OTP twice. The route throttle covers user retries.
- A handler that caches a code before sending must purge it when sending fails, then return a failure result. `RequestPhoneOtpAction` maps it to 503 `SERVICE_UNAVAILABLE` (`ErrorCodeEnum::SERVICE_UNAVAILABLE`).
- Misconfiguration must fail fast when the driver is resolved, not at the first send.

## Tests

`tests/Unit/Core/Services/Sms/`, `tests/Feature/Client/Http/Actions/PhoneOtpDeliveryTest.php`, `tests/Feature/Core/SmsSenderArchitectureTest.php`.
