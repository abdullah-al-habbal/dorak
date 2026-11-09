---
nodeid: docs.next_steps.audit_registration_errors
parentnode: docs.next_steps
childnodes: []
codeanchors:
  - backend/modules/Client/
  - backend/modules/Barber/
  - backend/modules/Brand/
  - backend/modules/Activation/
  - backend/modules/Core/Services/ApiExceptionResponseHandler.php
  - frontend/web/dashboard/src/app/
---

# Audit: Registration, Approval and Error Handling

Routes: [index](index.md) · [decisions](01-decisions.md).

This was a read-only audit on 2026-11-09. It is the evidence behind [NS-03](02-phase-1-access.md#ns-03-owner-self-registration-and-first-brand), [NS-29](02-phase-1-access.md#ns-29-error-handling-and-error-pages), [NS-30](02-phase-1-access.md#ns-30-barber-approval-queue), [NS-06](03-phase-2-governance.md#ns-06-brand-lifecycle) and [NS-10](04-phase-3-daily-operations.md#ns-10-notifications-feed-in-the-dashboard). Paths are relative to `backend/modules/` or `frontend/web/dashboard/`. Statements marked "likely" are not yet confirmed by a test.

## 1. How each account type joins today

| Account | Signs up where | Starts as | Who approves | Without Filament |
|---|---|---|---|---|
| Client | Client app, `POST /client/register` (`Client/Routes/Api/V1/client.php`) | `pending` (`ClientStatusEnum`) | Nobody. Verifying the email sets it to `enabled` (`Client/Eloquent/Resolvers/Client/VerifyEmailEloquentResolver.php`). | Works |
| Barber | Stylist app, `POST /barber/register` (`Barber/Routes/Api/V1/barber.php`) | `pending` (`BarberStatusEnum`). The token is limited to onboarding routes (`EnsureBarberAccountAccess`, `Onboarding` scope); login requires `enabled` (`Barber/Handlers/Barber/LoginHandler.php`). | The admin through `POST /admin/barbers/{barber}/activate` on `admin_api` only (`Activation/Routes/Api/V1/activation.php`), or a branch for a barber it manages (`branch-activation.php`) | **Broken.** There is no dashboard route or screen, so a self-registered barber can never be approved → [NS-30](02-phase-1-access.md#ns-30-barber-approval-queue) |
| Brand (owner) | **No interface.** `POST /api/v1/brands` needs a client token (`Brand/Routes/Api/V1/brands.php`); `POST /dashboard/brands` needs an existing owner (`Dashboard/Http/Actions/Brands/StoreBrandAction.php`). No mobile app calls either. | `pending` (`BrandStatusEnum`: only `pending` and `active`) | The admin, in the dashboard Brands queue (shipped) | No one can submit → [NS-03](02-phase-1-access.md#ns-03-owner-self-registration-and-first-brand) |
| Branch | Created by the owner in the dashboard, or as `first_branch` with a brand | `pending` (database default and `Brand/Services/FirstBranchProvisioner.php`) | **Nobody in practice.** `Dashboard/Http/Requests/Business/BranchRequest.php` accepts `status` (any `BranchStatusEnum`) from the owner on create and edit. The admin activates only on `admin_api`. | Not a real approval step → [D9](01-decisions.md#d9-branch-approval-model) (resolved: brand approval and plan limit are the gate; NS-06) |
| Admin | Never public | n/a | n/a | Needs invitations → [NS-04](02-phase-1-access.md#ns-04-admin-users) |

Dashboard owner login requires the owner's client account to be `enabled` (`Dashboard/Repositories/DashboardOwnerActorResolver.php`). A pending brand does not block login. The E2E pending owner proves this.

## 2. Messages and rate limits today

- **Emails sent:** only verification codes (`Client/Mail/SendEmailVerificationCode`, `Barber/Mail/BarberEmailVerificationCode`), password reset codes (`Client/Mail/SendPasswordResetCode`) and the dashboard email-change code (`Dashboard/Mail/SendDashboardEmailChangeCode`).
- **Nothing on submission, approval or rejection.** `Brand/Http/Actions/Admin/ApproveBrandAction.php` only updates the status: no notification, no email, no row lock. No rejected status exists.
- **Rate limits are per IP only:** `throttle:5,1` on register, login, forgot and reset; `throttle:3,1` on sending a verification code or phone OTP. There is no limit per email, no CAPTCHA and no honeypot.

## 3. Registration edge cases

| Case | Today | Required behaviour | Task |
|---|---|---|---|
| Same email registers again while unverified or pending | Rejected by `Rule::unique` (client and barber), which also reveals that the email exists | A generic "check your email" answer, a resent verification, and the flow resumes where it stopped | NS-03, NS-30 |
| An existing app client wants to become an owner | No path | "I already have a Dorak account": sign in, then create the brand on the same client account ([ADR 0001](../adr/0001-brand-owner-as-client.md)) | NS-03 |
| Rejected applicant | No rejected status | Sees the reason, edits and resubmits, within a resubmission cap; history kept | NS-06, D8 |
| Banned client registers again | Handled: `Client/Http/Requests/Client/RegisterRequest.php` skips the unique check for an actively banned email (confirm what the handler then answers) | The same treatment for barbers and owners | NS-03, NS-30 |
| Deleted client re-registers | Clients are soft-deleted, and the unique rule and the database index include deleted rows, so the email stays blocked forever | Deletion anonymises the account and frees the email (D10, resolved) | NS-03 |
| Abandoned, never-verified sign-ups | Kept forever | A scheduled clean-up after N days | NS-03 |
| Barber registers with a phone number already in use | `barbers.phone` is unique in the database, but `Barber/Http/Requests/Barber/RegisterRequest.php` has no unique rule and no normalisation (the client request normalises). **Likely a 500.** | A normalised phone with a unique validation error | NS-30 |
| Two admins approve and reject the same applicant at once | No lock on brand approval | A row-locked transition (the payouts pattern) | NS-06, NS-30 |
| Junk sign-ups flood the admin queue | Nothing stops them | Only email-verified submissions reach the queue; 5 per minute per IP and 5 per hour per email; a honeypot; no CAPTCHA at launch (D12, resolved) | NS-03 |
| One person is both a barber and an owner | Separate tables (`barbers`, `clients`), so the same email can exist in both | Allowed; each account signs in on its own portal. State this on the registration page. | NS-03 |

## 4. Backend error handling

How it works today: `bootstrap/app.php` renders JSON for `api/*`, and `Core/Services/ApiExceptionResponseHandler.php` turns every error into `success`, `statusCode`, `code`, `message`, `timestamp`, `request_id` (plus `errors` for validation), with an `X-Request-ID` header. The messages come from `core::messages` in `en` and `ar`. Every exception is logged through `LoggerService`. The six domain exceptions (`ChairHasActiveBookings`, `AffiliationResponse`, `AccountNotActive`, `FeatureNotEnabled`, `AccountBanned`, `SmsDelivery`) are caught and converted in their actions.

Problems, all handled in [NS-29](02-phase-1-access.md#ns-29-error-handling-and-error-pages):

1. **Specific messages are discarded.** A response without its own `code` gets the generic message. Seven translated throws reach users as "Forbidden" / "محظور":
   - `StoreBrandAction` (`brand_owner_only`);
   - the Admin, Owner, Barber, Brand and Earnings authorization middlewares in `Dashboard/Http/Middleware/`.
2. **Status map gaps:**
   - 405 and 413 fall to `UNPROCESSABLE_ENTITY`.
   - 503 (maintenance mode) becomes `SERVER_ERROR` "Server error", although `ErrorCodeEnum::SERVICE_UNAVAILABLE` exists. It is used only by `Client/Http/Actions/Client/RequestPhoneOtpAction.php`.
3. **The generic texts are duplicated** in `Core/Lang/{en,ar}/core.php` and `messages.php`, with different wording ("Not found" vs "Resource not found"). The handler reads `messages.php`.
4. **The barber duplicate phone** case is likely a 500 (section 3).
5. **Coverage:** only `tests/Feature/Core/RequestTracingTest.php` and `NotificationInboxTest.php` touch the error format. No test checks each status code.
6. **Laravel web pages:** the Website module serves `/`, `/features` and `/pricing` (`Website/Routes/Web/website_routes.php`), but there is no `resources/views/errors/`. Visitors get Laravel's default English pages, unbranded and not localized.

## 5. Dashboard error pages

| Case | Today | Localized | Gap → NS-29 |
|---|---|---|---|
| 404 | `src/app/not-found.tsx` → `NotFoundScreen`, with a "Back to your workspace" link. The proxy rewrites unknown guard and dashboard paths with a real 404 status (`src/proxy.ts`, `route-policy.util.ts`). | en, ar | None |
| 500 | `src/app/error.tsx` → `ErrorScreen`, using Next 16's `retry` correctly | en, ar | Root only, so a portal error replaces the sidebar and header. No request ID is shown, the error isn't logged, and `error` is unused. |
| Root-layout failure | No `global-error.tsx` | n/a | Next's unstyled English page. Needs its own `<html>`/`<body>` and bilingual text. |
| 403 | By design: a wrong-role URL redirects to the user's own portal (`route-policy.util.ts`), and screens render a localized forbidden `EmptyState` (for example `plans-screen.tsx`) | en, ar | `errors.forbidden` in `src/locales/*/errors.constant.ts` is unused: use it or delete it. Don't adopt the experimental `forbidden.tsx`. |
| 401 | `services/api/core/client.ts`: refresh once, then report the expired session and go to login | n/a | None |
| 400, 422 | Inline field errors (`api-field-errors.util.ts`, `mapApiFormError`) | en, ar | None |
| 429, backend down | Login maps both (`services/api/auth/failure-map.util.ts`). The proxy maps an unreachable backend. | en, ar | Check every screen's message for 429 and 502/503; add a maintenance page |
| Language on first paint | `src/app/layout.tsx` renders `lang="en" dir="ltr"`; `i18n-provider.tsx` switches after hydration | n/a | Arabic pages, including 404, flash left-to-right, and the first `lang` is wrong for screen readers and search engines. Set `lang` and `dir` on the server from the locale cookie. |
