Referenced from [`../../AGENTS.md`](../../AGENTS.md).

## 8. Backend contract and its known defects

Laravel 13 + **Sanctum opaque bearer tokens** (not JWT). Base `/api/v1`.
Client routes are under `/client`.

| Call | Route | Notes |
|---|---|---|
| Register | `POST /client/register` | 201. **Requires `password_confirmation`.** Returns `{token, client}` — authenticated *before* verification. Backend dispatches the verification OTP asynchronously (`SendEmailVerificationCodeJob`, after commit); the client does **not** call `/send` on registration |
| Login | `POST /client/login` | `{email, password}`. Email only — **there is no phone login** |
| Refresh | `POST /client/refresh-token` | `auth:client`. Revokes and reissues. Used as the session-validity probe |
| Send code | `POST /client/email/verify/send` | `auth:client`. 6 digits, 10-minute TTL. Regenerates and invalidates any previous code. Rate-limited: `throttle:3,1` (3/min) |
| Verify | `POST /client/email/verify` | `auth:client`, `{code}`, `size:6`. 422 on wrong code. 5 wrong attempts invalidate the code (forces a resend) |
| Phone code | `POST /client/phone/otp` | `auth:client` (active only), `{phone}`; sends one SMS, 6 digits hashed in cache, 10-minute TTL, `throttle:3,1`. 422 if the phone is verified on another client |
| Phone verify | `POST /client/phone/verify` | `auth:client` (active only), `{code}`, `throttle:5,1`. 422 on a wrong/expired code; 5 wrong attempts invalidate it. Returns the client with `phone_verified_at`. `PATCH /client/profile` rejects a changed `phone` with 422 |
| Logout | `POST /client/logout` | `auth:client`. 200 with **no `data` key** |
| Change password | `PATCH /client/password` | `auth:client`. `{current_password, password, password_confirmation}` (`confirmed` rule). 422 field errors are real copy. Success message is an untranslated key — never render it |
| Barber detail | `GET /explore/barbers/{barber}` | Public. Returns `{...BarberResource, services}` — services nested inside the barber resource |
| Currencies | `GET /currencies` | Public. Returns currency list |

Also declared and unused: `forgot-password`, `reset-password`,
`social/{provider}`.

### Defects to work around, not "fix" from the client

1. **`message` is an untranslated key.** The backend defines 4 translation keys
   and references ~21, falling back to the key itself. A rejected login returns
   the literal `core::messages.invalid_credentials`. **Never render
   `ApiException.message`.** Map status + type to a local ARB string via
   `AuthError.from`. The `errors` map on a 422 *is* real Laravel copy and is
   safe to show per-field.
2. **No `GET /client/me`.** There is no way to fetch the current user. This is
   why session restore probes with `refresh-token`.
3. **`MAIL_MAILER=log`.** Verification and reset codes are written to
   `storage/logs/laravel.log` and never delivered. Verification is therefore
   non-blocking by design.
4. **`SANCTUM_EXPIRATION` is unset** — tokens never expire server-side. This is
   why an offline restore keeps the session.
5. **Guard 401s bypass the envelope.** An expired token returns a bare
   `{"message":"Unauthenticated."}`, mapped to `ApiException(401, 'UNKNOWN')`.
   Branch on `isUnauthorized`, **never** on `code`.
6. Rate limiting only on `/email/verify/send`; other auth routes are
   unthrottled; `forgot-password` leaks account existence; disabled/banned
   clients can still log in. Server-side issues, logged, not client-fixable.

---

