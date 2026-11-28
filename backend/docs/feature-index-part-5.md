---
codeanchors:
  - backend/modules/
---

Part 5 of 8 · [Feature Index — Dorak Backend](feature-index.md) · [Previous](feature-index-part-4.md) · [Next](feature-index-part-6.md)

### Admin pages (PRD 13 Phase 2, historical; since replaced by the dashboard, NS-28)
- Booking CreatePage — already existed
- Review CreatePage + EditPage — already existed
- Application CreatePage (JobPosting) — already existed
- All admin pages verified present in all modules

### Phase 5 — API Contract Tests (PRD 13)
- `tests/Feature/Contract/ApiResponseContractTest.php` — 40 tests covering all 30+ endpoints
- Verifies: API envelope structure, HTTP status codes, JSON field presence, data types (string/int/array/bool)
- Covers previously untested Client module (6 endpoints: login, register, logout, refresh-token, profile, universe preference)
- Covers previously untested GetBarberDetailAction
- Contract tests pass: 236 total, 1212 assertions

### Bugs Fixed During Contract Tests
- ClientModel: added missing `HasApiTokens` trait (Sanctum) — login/register/refresh-token were broken at runtime
- Created Sanctum `personal_access_tokens` migration in Core module — table was missing from test migrations

### Skills
- `10StrictBackendArchitecture/SKILL.md` — FormRequest enforcement, Command objects, strict imports, Resource composition
- `12StrictEnums/SKILL.md` — Backed Enum patterns, model casts, Rule::enum, comparison rules, AND Flutter `@JsonSerializable`/`@JsonKey`/`@JsonEnum` mandate

### JobPostingDto Full Alignment
- `create_job_postings_table` migration — includes `requirements` (json), `location` (string), `type` (string)
- `JobPostingModel` — updated fillable + `array` cast for `requirements`
- `JobPostingResource` — exposes `requirements`, `location`, `type` in API response
- `JobPostingFactory` — seeds new fields
- `ApiResponseContractTest` — asserts `location` + `type` presence
- Frontend: `JobPostingEntity` `title`/`description` → `Map<String, dynamic>` with locale getters, `status` replaces `isActive`, `requirementsList`
- Frontend: `JobPostingDto` parses new shape, 3 widgets use locale extraction

### Profile Expand (Phone, Avatar, Soft Delete)
- `ClientModel` — added `phone`, `avatar`, `status`, `SoftDeletes` trait; fillable + casts updated
- `UpdateProfileAction` [PATCH /api/v1/client/profile] — now accepts/returns `phone` field
- `UploadAvatarAction` [POST /api/v1/client/avatar] — multipart upload, stores in `public/avatars`, returns URL. Auth:client
- `DeleteAccountAction` [DELETE /api/v1/client/account] — requires password confirmation; 409 `ACCOUNT_HAS_ACTIVE_BOOKINGS` while any booking is pending/confirmed/in_progress; otherwise revokes tokens, scrubs PII, soft-deletes, and anonymizes service history (HIST-2) via the shared `ClientAccountDeletion` service, also used by the admin panel (Task 36). Auth:client
- 5 contract tests for account deletion

### Phone OTP Verification
- `RequestPhoneOtpAction` [POST /api/v1/client/phone/otp] — normalizes the phone, caches a hashed 6-digit code (10-min TTL) and sends one SMS through the `Modules\Core\Contracts\SmsSender` strategy resolved by `SmsSenderFactory` from `services.sms.driver` (`log` for local/testing, `generic_http` posts to a configurable gateway/WhatsApp webhook via `GenericHttpSmsSender`; env: `SMS_DRIVER`, `SMS_HTTP_URL`, `SMS_HTTP_FORMAT`, `SMS_HTTP_HEADERS`, `SMS_HTTP_PAYLOAD` with `{{phone}}`/`{{message}}` placeholders, `SMS_HTTP_TIMEOUT`). A gateway failure (`SmsDeliveryException`) purges the cached code and returns 503 `SERVICE_UNAVAILABLE`. Auth:client (active), `throttle:3,1`
- `VerifyPhoneOtpAction` [POST /api/v1/client/phone/verify] — checks the hashed code (5-attempt lockout), sets `phone` + `phone_verified_at`, returns `ClientProfileResource`. Auth:client (active), `throttle:5,1`
- `PATCH /api/v1/client/profile` returns 422 for a changed `phone`; the phone changes only through this flow
- Tests: `tests/Feature/Client/Http/Actions/PhoneOtpTest.php`, `PhoneOtpDeliveryTest.php`, `tests/Unit/Core/Services/Sms/`

### Email Verification
- `SendEmailVerificationAction` [POST /api/v1/client/email/verify/send] — sends 6-digit code to client email, 10-min TTL cache. Auth:client
- `VerifyEmailAction` [POST /api/v1/client/email/verify] — validates cached code, sets `email_verified_at`. Auth:client
- `SendEmailVerificationCode` — mailable with Blade template
- 4 contract tests

### Forgot / Reset Password
- `ForgotPasswordAction` [POST /api/v1/client/forgot-password] — sends 6-digit reset code to email, 10-min TTL. No auth.
- `VerifyResetCodeAction` [POST /api/v1/client/forgot-password/verify] — checks the reset code without consuming it; 422 `VALIDATION_FAILED` + `errors.code` for a wrong code or unknown email (no enumeration). Shares a 5-attempt budget with reset via `PasswordResetCodeVerifier` (Task 35). No auth.
- `ResetPasswordAction` [POST /api/v1/client/reset-password] — validates code + new password, resets password, ends every session, dashboard included (BG-60); a bad code is 422 `VALIDATION_FAILED` + `errors.code`. No auth.
- `SendPasswordResetCode` — mailable with Blade template
- 4 contract tests
