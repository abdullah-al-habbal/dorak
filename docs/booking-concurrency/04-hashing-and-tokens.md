---
nodeid: docs.booking-concurrency.hashing-and-tokens
parentnode: docs.booking-concurrency
childnodes: []
codeanchors:
  - backend/modules/Client/
  - backend/modules/Core/Services/
  - backend/modules/Dashboard/
---

# 4. Hashing and tokens

Routes: [booking concurrency](index.md) · [documentation graph](../index.md)

| Item | Status | Reference |
|---|---|---|
| Phone OTP code | hashed with `Hash::make`, checked with `Hash::check` | `RequestPhoneOtpHandler.php:33`, `VerifyPhoneOtpHandler.php:25` |
| Barber email verification code | hashed | `Barber/Services/BarberEmailVerification.php:37,50` |
| Dashboard email-change code | `code_hash`, `Hash::check` | `Dashboard/Handlers/Profile/VerifyDashboardEmailChangeHandler.php:31` |
| Client password-reset code | **plaintext in cache**, compared with `hash_equals` | `Client/Services/PasswordResetCodeVerifier.php:163,175` |
| Staff (barber, branch) password-reset code | **plaintext in cache**, `hash_equals` | `Core/Services/StaffPasswordResetCodes.php:84,96` |
| Client email-verify code | **plaintext in cache**, compared with `!==` (not constant time) | `Client/Handlers/Client/SendEmailVerificationHandler.php:305`, `VerifyEmailHandler.php:30` |
| OTP generation | `random_int(100000, 999999)`, a CSPRNG; 6 digits are brute-forceable without a lockout (attempt counters and route throttles exist) | `RequestPhoneOtpHandler.php:88` |
| Dev OTP logging | gated to the `local` environment, logs the code | `ForgotPasswordHandler.php:251-257` |
| Dashboard refresh token | `Str::random(64)`, stored as sha256, unique `char(64)` | `DashboardRefreshTokenResolver.php:98,128` |
| Dashboard session claim | HMAC-SHA256 with `hash_equals` | `Dashboard/Support/DashboardSessionClaim.php:38,143,183-185` |
| Sanctum tokens, passwords | hashed (framework default, `Hash::make`) | `LoginHandler.php:26` |
| Phone numbers, FCM tokens | plaintext, needed to send | `clients.phone`, `device_tokens.token` |
| Face-photo fingerprint | md5 | `UploadFaceProfilePhotoAction.php:38` |
| Idempotency fingerprint | none exists yet; use sha256, compare with `hash_equals` | [file 03](03-idempotency-and-uniqueness.md) |

## Gaps

1. Hash the client and staff password-reset codes and the client email-verify code at rest, as the phone OTP already is.
2. Compare the email code with `Hash::check` or `hash_equals`, not `!==`.
3. Verify-and-consume is not atomic. `VerifyPhoneOtpHandler.php:23-38` does `Cache::get` then `Cache::forget`, so two parallel verifies with the right code both succeed. The effect is idempotent (the phone is marked verified twice), but the same shape sits in `VerifyEmailHandler.php:28-37`, `PasswordResetCodeVerifier.php:173`, `StaffPasswordResetCodes.php:94` and `BarberEmailVerification`. For a password reset a second successful use of one code is a real weakness. Use `Cache::pull` or a lock so one code is consumed once.
4. The attempt counter is incremented only after a wrong code and checked after the guess (`VerifyPhoneOtpHandler.php:43-58`), so parallel wrong guesses in one throttle window are bounded by the route throttle (5 per minute) only. Check and increment atomically.
5. Switch the face-photo fingerprint from md5 to sha256 (non-security use today, but there is no reason to keep md5).

## Not examined

Barber and branch `ForgotPassword` and `ResetPassword` handlers (assumed to use `StaffPasswordResetCodes`), `AccountBanService`, and the barber and branch email verification handlers.
