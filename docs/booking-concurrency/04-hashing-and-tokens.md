---
codeanchors:
  - backend/modules/Client/
  - backend/modules/Core/Services/
  - backend/modules/Dashboard/
---

# 4. Hashing and tokens

Routes: [booking concurrency](index.md) · [documentation graph](../index.md)

| Item | Status | Reference |
|---|---|---|
| One-time codes (client email, phone, client and staff password reset, barber email) | hashed, and read, compared, counted and consumed under one cache lock per key | `Core/Services/OneTimeCodes.php` |
| Dashboard email-change code | `code_hash`, `Hash::check`, on the pending row locked `FOR UPDATE` | `Dashboard/Handlers/Profile/VerifyDashboardEmailChangeHandler.php` |
| OTP generation | `random_int(100000, 999999)`, a CSPRNG; 6 digits are brute-forceable without a lockout (attempt counters and route throttles exist) | `RequestPhoneOtpHandler.php` |
| Dev OTP logging | gated to the `local` environment, logs the code | `ForgotPasswordHandler.php` |
| Dashboard refresh token | `Str::random(64)`, stored as sha256, unique `char(64)` | `DashboardRefreshTokenResolver.php:98,128` |
| Dashboard session claim | HMAC-SHA256 with `hash_equals` | `Dashboard/Support/DashboardSessionClaim.php:38,143,183-185` |
| Sanctum tokens, passwords | hashed (framework default, `Hash::make`) | `LoginHandler.php:26` |
| Phone numbers, FCM tokens | plaintext, needed to send | `clients.phone`, `device_tokens.token` |
| Face-photo fingerprint | md5 | `UploadFaceProfilePhotoAction.php:38` |
| Idempotency fingerprint | none exists yet; use sha256, compare with `hash_equals` | [file 03](03-idempotency-and-uniqueness.md) |

## Gaps

1. Switch the face-photo fingerprint from md5 to sha256 (non-security use today, but there is no reason to keep md5).

## One-time code rules

- A right code works once. Checking it with `forgot-password/verify` doesn't consume it; a wrong guess there counts against the same budget as a reset.
- A phone code is consumed even when verification then finds the number taken: the client asks again, with another number or after it is freed.
- A guess that can't get the lock is refused. A code that can't be stored or burned throws `OneTimeCodeUnavailableException` (503), so nothing is sent or changed. The three forgot-password routes send nothing and answer as usual, so the answer doesn't show which emails have accounts.
- A dashboard password change or reset burns the pending app reset code first, outside its database transaction. If that fails, the password stays as it was.
- The public owner verify route spends one hash operation on unknown, verified and banned emails, like on a pending one.
- The cache lock spans servers only with a shared cache store (database or Redis).

Parallel tests: `tests/Concurrency/ConcurrentOneTimeCodesTest.php` (all seven flows).
