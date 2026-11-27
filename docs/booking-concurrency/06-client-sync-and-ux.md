---
codeanchors:
  - frontend/mobile/packages/core/lib/src/network/interceptors/
  - frontend/mobile/packages/core/lib/src/network/exceptions/
  - frontend/mobile/apps/client_app/lib/src/features/booking/
  - frontend/web/dashboard/src/services/api/proxy/
---

# 6. Client sync and UX

Routes: [booking concurrency](index.md) · [documentation graph](../index.md) · [idempotency](03-idempotency-and-uniqueness.md)

What the apps do when the backend answers 409, 429, 503 or a lost response. Read against the code on 19 November 2026. The dashboard and the business app were only checked at the proxy; the claims below are about `client_app` and the shared `core` network layer unless a row says otherwise.

## Retry policy (Confirmed)

`RetryInterceptor` (`packages/core/lib/src/network/interceptors/retry.interceptor.dart`):

- Retries `GET`, `PUT`, `PATCH` and `DELETE` (`RetryInterceptorConstants.retryInterceptorIdempotentMethods`), never `POST`.
- Retries on a timeout, a connection error, HTTP 429 and any status of 500 or more, up to 3 times, after 0.5 s, 1 s and 2 s.
- It does not read `Retry-After`, so a 429 is retried after at most 2 s even when the server asked for a minute, and each retry spends another unit of the rate limit.
- `PATCH` and `DELETE` are retried on a 5xx without a key. The lifecycle `PATCH` routes (cancel, accept, start) are safe on a repeat only because a second call is refused with an invalid-status error; the retry can therefore turn a success whose response was lost into an error message. Deletes are the same ([fix order](10-fix-order.md), convention 7).

`POST /bookings` is not retried automatically. Since BG-9 a user who taps again after a timeout re-sends the same `Idempotency-Key` for the same request and gets the original booking ([file 03](03-idempotency-and-uniqueness.md)). `BranchDetailBloc` keeps the key until the request changes or succeeds.

## Error mapping (Confirmed)

| Status | `ApiException` | What `client_app` shows after a booking submit |
|---|---|---|
| 409 (any code) | `statusCode == 409` | `bookingConflictMessage`, "That slot was just taken. Please pick another time." `BranchBookingError.submitMessage` maps every 409 to it, so a 409 that is not a taken slot (for example a chair that is not available) is described wrongly |
| 422 `idempotency_key_reused` | `ApiException` | generic error; cannot happen from the app, which sends a new key when the request changes |
| 429 | `isRateLimited` | generic error on the booking screen. Only the OTP and phone-verification screens test `isRateLimited` and say anything specific |
| 503, 500 | `isServerError` | generic error. There is no "try again in a moment" wording and no distinction from a bug |
| network failure | `NetworkException` | `errorNetwork` |

`bookingConflictMessage` exists in English and Arabic (`packages/localization/l10n/app_en.arb`, `app_ar.arb`). A search of the English file found no key for a rate-limited or temporarily unavailable booking; the only rate-limit text found is `feedbackRateLimited` (feedback screen).

## After a conflict the list is stale (Confirmed)

`_onSubmitted` in `BranchDetailBloc` catches the error, sets `isSubmitting: false` and `submitError`, and stops. It does not call `_loadSlots`, and the selected time stays selected. The user sees "conflict", taps submit again with the same key and the same slot, and gets the same 409, until they change the date or a service (every such event reloads slots). A reload of the slot list on a 409, with the stale time cleared, is the one change that makes a lost race recoverable without guessing.

## Dashboard and proxy

The dashboard talks to the backend through its proxy (`frontend/web/dashboard/src/services/api/proxy/forward.ts`), which builds the outgoing headers itself (locale, client IP, token); it does not copy an arbitrary request header. An `Idempotency-Key` set by a dashboard form would therefore not reach the backend. The dashboard does create bookings: the walk-in dialog (`components/bookings/dialogs/walk-in-dialog.tsx`) posts `bookings/walk-in` through the proxy allow list. It disables its buttons while the request is pending (`busy`), which stops a double click, but a retry after a lost response is a second request with no key and gets a 409. Walk-in has no key on the backend either ([file 03](03-idempotency-and-uniqueness.md)). Any dashboard idempotency work must add the header to the proxy first. Not checked: the business app's booking screens.

## Double submit

The submit button is disabled while `isSubmitting` is true, so a second tap in flight is ignored. A second tap after the response is a new submission with the same key; that is the replay case and is covered by the backend and bloc tests ([file 07](07-test-coverage.md)).

## Options

1. On a 409 from `createBooking`, reload the slots and clear the selected time (client_app, small). BG-20.
2. Map 429 and 503 to their own message, EN and AR, with the wait time when `Retry-After` is present (core and client_app, small). BG-20.
3. Make the retry interceptor honour `Retry-After` and stop retrying `PATCH` and `DELETE` lifecycle calls on a 5xx unless they carry a key or are idempotent on the server (core, then the backend fixes of fix order convention 7). BG-21.
4. Forward `Idempotency-Key` in the dashboard proxy together with the first keyed dashboard endpoint (walk-in is the candidate). BG-36 in the [fix order](10-fix-order.md) owns the generic middleware.

Each option needs a bloc or interceptor test that fails first, and `melos verify` before commit (mobile guide).
