---
nodeid: docs.next_steps.phase_1
parentnode: docs.next_steps
childnodes: []
codeanchors:
  - backend/modules/Dashboard/
  - backend/modules/Brand/
  - backend/modules/Barber/
  - backend/modules/Activation/
  - backend/modules/Admin/
  - backend/modules/Core/
  - frontend/web/dashboard/src/
---

# Phase 1: Nobody Is Locked Out

Routes: [index](index.md) · [decisions](01-decisions.md) · [registration and error audit](09-audit-registration-and-errors.md).

Without these tasks, someone can't get in, can't get back in, can't be approved, or hits an error page with no way forward. Each one is a launch blocker. The tasks are listed in execution order.

## NS-01: Password recovery on every login

- **Guards:** admin, manager, owner, barber.
- **Story:** someone who forgot their password asks for a reset link on the login page and sets a new password, without contacting anyone.
- **Backend: New.** The dashboard API has only `/login` and `/refresh`, with no forgot or reset route.
  - Reset-token tables already exist for each account type (`password_reset_tokens_admins`, `_branches`, `_clients`, `_barbers`).
  - The mobile forgot and reset actions for client, branch and barber can be reused behind a dashboard route.
  - Admins have no reset route at all.
  - Limit requests per IP **and per email**; today's limits are per IP only ([audit §2](09-audit-registration-and-errors.md#2-messages-and-rate-limits-today)).
- **Dashboard:**
  - a "Forgot password?" link on each `/dashboard/<guard>/login`;
  - a request page that gives the same answer whether or not the email exists;
  - a reset page opened from the email link;
  - a success message that returns to the login page.
- **Done when:**
  - Pest covers each account type (expiry, single use, throttling, unknown email).
  - E2E covers the request and reset pages with a seeded token.
  - The security review passes, because this is an authentication change.

### NS-01 as built

- **Routes:** `POST /api/v1/dashboard/password/forgot` and `/password/reset`, public, built on the existing Laravel password brokers (`auth.passwords.{admins,branches,barbers,clients}`; 60-minute expiry, bcrypt-hashed single-use tokens). The mail is sent after the response (`defer()`), so a known and an unknown email take the same time and get the same answer.
- **Limits:** forgot is 5 per minute per IP and 5 per hour per email (actor type plus a SHA-256 of the lowercased email; unknown emails count too). Reset is 5 per minute per IP only, so junk attempts cannot lock the real owner out. `TRUSTED_PROXIES` (`Core/Config/trustedproxy.php`, never `*`) decides which `X-Forwarded-For` the backend believes; the BFF forwards the right-most entry.
- **Eligibility:** the account is checked again when the password is set, under a row lock: owner needs an enabled, verified client with a brand; barber needs a login, a password and no ban or disabled status.
- **After a reset:** every dashboard session and refresh token of the account is revoked, and any open mobile reset code is cleared. A mobile reset clears the dashboard token the same way (`DashboardCredentialRevoker`, `DashboardMobileResetCodeCleaner`).
- **Dashboard:** `/dashboard/<guard>/forgot-password` and `/reset-password` are public for every session state. The reset page sends `Referrer-Policy: no-referrer`, is `noindex`, and removes `token` and `email` from the address bar on load.
- **Reusable by NS-04:** `DashboardPasswordResetLinkSender::send()` creates the token and mails the link, so an admin invite is a reset link.

## NS-02: Account page

- **Guards:** all four.
- **Story:** any user changes their name, email (with verification), password and notification settings. A manager can replace the password the owner set for them.
- **Backend: Ready.** The routes are:
  - `GET|PATCH /profile`;
  - `POST /profile/email/change` and `/profile/email/verify`;
  - `PUT /profile/password`;
  - `GET|PATCH /profile/notifications`.
- **Dashboard:**
  - allow-list rules for these routes;
  - an "Account" entry in the user menu, which has only "Sign out" today;
  - a page with Profile, Email, Password and Notifications sections;
  - the language preference, if the profile exposes it (check in the task).
- **Done when:**
  - Vitest covers the schemas and proxy rules.
  - E2E covers each section for a manager, and covers one other guard.

### NS-02 as built

- **Page:** `/dashboard/<guard>/account` for all four guards, opened from a new "Account" item in the user menu. Sections: Profile (display name), Email (request a code, then confirm; the old email keeps working until then), Password, Notifications (four optimistic switches) and Language (`PATCH /dashboard/settings`, then the locale cookie, so emails follow it too).
- **Deviation from the plan:** `PUT /profile/password` is not on the proxy allow-list. The page calls `PUT /api/auth/password/change`, a BFF route that adds this session's refresh token, so the backend ends the account's other sessions and keeps this one. A password change also deletes any open reset link and mobile reset code.
- **Allow-list:** `profile`, `profile/notifications` and `settings` (GET, PATCH) and `profile/email/(change|verify)` (POST), for all four guards.
- **E2E:** two dedicated admins in `E2eDashboardSeeder` (a reset has to end every session, and the account spec changes the password and email, so neither can use a shared saved session). The seeder leaves a known hashed reset token and a pending email change with a known code.

## NS-29: Error handling and error pages

- **Guards:** all, including website visitors.
- **Story:** whatever fails, the user sees a branded page in their own language, can recover or go back, and can quote a request ID to support. API errors keep their specific meaning.
- **Evidence:** [audit §4 and §5](09-audit-registration-and-errors.md#4-backend-error-handling).
- **Backend:**
  1. In `ApiExceptionResponseHandler`, keep a translated specific message, such as the seven authorization messages, instead of replacing it with the generic text. Keep the generic text when no specific message was set.
  2. Map 405 and 413 to their own codes (new `ErrorCodeEnum` cases, translated in en and ar), and map 503 to `SERVICE_UNAVAILABLE`.
  3. Merge the duplicated generic texts (`Core/Lang/*/core.php` and `messages.php`) into one source.
  4. Add a Pest test per status code (400, 401, 403, 404, 405, 409, 413, 422, 429, 500, 503) for the response shape, the code, the localized message and `X-Request-ID`, in both locales.
  5. Add English and Arabic 404, 500 and 503 Blade views for the Laravel website pages, which stay in Laravel ([D13](01-decisions.md#d13-the-laravel-public-website)).
- **Dashboard:**
  1. Add `src/app/global-error.tsx`, with its own `<html>`/`<body>`, bilingual text (the locale context isn't available there), and retry and home actions.
  2. Add `src/app/dashboard/[guard]/(portal)/error.tsx`, so an error keeps the sidebar and header, shows the request ID or digest, and logs the error.
  3. Render `lang` and `dir` on the server from the locale cookie in `src/app/layout.tsx`, so Arabic pages stop flashing left-to-right.
  4. Check every screen's message for 429 and for a backend that is down (502/503). Add a localized "service unavailable or maintenance" state.
  5. Use or delete the unused `errors.forbidden` dictionary entry. Keep the redirect and in-page forbidden pattern, and don't adopt the experimental `forbidden.tsx`.
- **Implemented (NS-29, done):**
  - **API errors:** `ApiExceptionResponseHandler` keeps a deliberate message from an `AuthorizationException`, `AccessDeniedHttpException` or `ConflictHttpException` (not Laravel's "This action is unauthorized."); anything else gets the localized generic text. New codes `METHOD_NOT_ALLOWED` (405) and `PAYLOAD_TOO_LARGE` (413); 503 is `SERVICE_UNAVAILABLE`. The generic texts live only in `Core/Lang/*/messages.php`; the unused `core.php` files are deleted. Existing codes and the envelope are unchanged (mobile unaffected; a 405 or 413 used to arrive as `UNPROCESSABLE_ENTITY`).
  - **Root cause fixed on the way:** the three Filament panel providers translated `core::messages.*` while registering, before the Core namespace existed, and Laravel cached an empty group, so every generic API message came back as the raw key. They now translate lazily. Tests: `tests/Feature/Core/ApiErrorStatusTest.php`.
  - **Website:** `Website/Resources/views/errors/{404,500,503}` (self-contained, en and ar by `Accept-Language`, no Vite, database or session), registered in the `errors` view namespace by `WebsiteServiceProvider`. Tests: `tests/Feature/Website/ErrorPagesTest.php`.
  - **Dashboard:** `global-error.tsx`; a portal `error.tsx` that keeps the shell, logs the error and shows a reference (the backend `request_id`, now carried through the proxy envelope and `ApiClientError`, else Next's digest); `lang` and `dir` rendered from the locale cookie in the root layout; `ApiErrorCode.ServiceUnavailable` for a backend 503 with a maintenance message; `errors.forbidden` is used by the portal error page for 403.
  - **Cost of server-side `lang`/`dir`:** reading the cookie in the root layout makes the document render per request, so the root layout sets `export const instant = false` (Cache Components otherwise fails the build).
  - **Not done:** the backend takes its locale from the signed-in account's preference, not from `Accept-Language`, so a signed-out API error (for example a login 429) is still English.
- **Done when:**
  - Pest covers each status code.
  - Vitest covers the new pages' copy selection.
  - E2E covers the 404 in Arabic with the correct `dir` on first paint, and a forced portal error that keeps the navigation.

## NS-03: Owner self-registration and first brand

- **Guards:** a new owner (public, signed out); the admin, who approves in the existing queue.
- **Decisions:** [D2](01-decisions.md#d2-how-a-new-brand-owner-joins) (public web registration), D10, D11 and D12, all resolved.
- **Story:** a shop owner registers their business on the web, confirms their email, and follows the review on a status page. They get an email at each step, prepare their brand while waiting, and add branches once approved.
- **Flow:**
  1. `/register/business`: owner details, brand details and an optional first branch. It also links to "I already have a Dorak account, sign in", for an existing app client.
  2. "Check your email": a verification code. Only verified submissions enter the admin queue.
  3. A status page in the owner portal: Submitted → Under review → Approved, or Rejected with the reason and "Fix and resubmit" (rejection itself comes from NS-06).
  4. Early access while pending ([D11](01-decisions.md#d11-early-access-for-a-pending-owner)):
     - **Allowed:** edit the brand profile, and prepare **one** branch with its hours, chairs and services.
     - **Not allowed:** stylists, invitations, extra branches, client visibility or bookings, until approval.
  5. Emails at submitted, approved and rejected, in the owner's language. The matching in-app notifications come with NS-10.
- **Backend: New.**
  - Add a public owner-registration endpoint under the dashboard API. It creates the client account and calls the existing create-brand handler (`CreateBrandRequest` already takes the name, currency, logo, description, universe and an optional `first_branch`). The brand is created pending.
  - Add verify and resend endpoints, reusing the client verification code mail.
  - Add an endpoint for an existing, signed-in client to create their first brand.
  - Add the three emails, with en and ar templates.
  - Add a scheduled clean-up of never-verified sign-ups after **7 days** (a constant), for owners and app clients.
  - Limits: **5 per minute per IP and 5 per hour per email**, plus a honeypot field. No CAPTCHA at launch ([D12](01-decisions.md#d12-captcha-on-public-forms)).
  - **Account deletion ([D10](01-decisions.md#d10-re-registration-after-account-deletion)):** find every place a client is deleted today, and make deletion anonymise the email, name and phone (bookings kept), so the email is freed.
- **Next.js:**
  - public routes outside the portal layout;
  - a route handler under `app/api/auth/*`, because the browser never calls Laravel directly;
  - allow-list rules;
  - the existing "waiting for approval" notice, reused on the branch screen.
- **Edge cases** ([audit §3](09-audit-registration-and-errors.md#3-registration-edge-cases)), each with a Pest test:
  - The same email registering again while unverified or pending gets a generic "check your email" answer and a resent code. The flow resumes; there is no duplicate account and no message revealing that the email exists.
  - An existing client is sent to sign in and creates the brand on the same account.
  - A banned email is refused, matching the client rule.
  - A deleted (anonymised) account's email registers as a fresh account ([D10](01-decisions.md#d10-re-registration-after-account-deletion)).
  - The same email as a barber account is allowed, because they are separate portals. The page says so.
  - A duplicate first-branch email gets a validation error, as today.
  - Throttling per IP and per email.
- **Implemented (NS-03, done):**
  - **Routes** (public, under `dashboard/owner`): `POST register` and `POST code/resend` (5/min per IP and 5/hour per email, shared; the email key is lower-cased and hashed), `POST verify` (10/min per IP and 10/hour per email), `POST brand` (the sign-in limit). The dashboard reaches them through `app/api/auth/register/{business,resend,verify,existing}`; the page is `/register/business`, outside the guarded `/dashboard` tree.
  - **One answer for every email.** Register and resend reply "check your email" for a new, unverified, verified and banned email, and for a filled honeypot (`website`); the work runs after the response (`defer`), so timing matches. An existing account is never changed: an unverified one only gets its code again. This replaces the spec's "an existing client is told to sign in" with the on-page "I already have a Dorak account" choice, which calls `POST brand` with the account's password and creates the first brand on the same account. Wrong password, an unverified account and an account that already owns a brand all answer 401; a banned one answers 403 `ACCOUNT_BANNED`.
  - **Verify opens the owner session.** Only the step that flips an account from unverified to verified issues the session (`DashboardSessionIssuer`, shared with login), so it is never a way to sign in to a confirmed account. A wrong code, an unknown email and a banned account all answer 422.
  - **Review queue.** The dashboard brand list and `PATCH admin/brands/{brand}/approve` only see brands whose owner confirmed their email; approving one that has not answers 422. A real approval queues the approved email.
  - **D11 on the server.** `BrandApprovalGuard` refuses (403 `brand_not_approved`) adding a stylist, inviting a stylist, a walk-in booking and a second branch while the brand is pending. Branches stay `pending` until switched on, so clients still see nothing. Platform admins are not limited.
  - **Emails** (`OwnerBrandMailer`, queued, owner's saved language, en and ar): submitted (sent on verification), approved (sent on approval), rejected (built and tested, sent by the NS-06 rejection flow).
  - **Clean-up:** `signups:purge-unverified`, daily at 03:30, removes plain email sign-ups still unverified after 7 days (`UNVERIFIED_SIGNUP_RETENTION_DAYS`), with a still-pending brand and its branches, through `ClientAccountDeletion`. It skips verified, social-login, phone-verified and booked accounts, and any account whose brand is no longer pending.
  - **D10 was already in place:** `ClientAccountDeletion` (used by the app and the admin panel) anonymises the name, email and phone, keeps the bookings and frees the email. This task added the test that the email registers fresh.
  - **Status page:** `/dashboard/owner/status` shows Submitted, Under review (a label on a pending brand) and Approved, and is built to take NS-06's rejected state.
  - **Not done:** a brand-profile editor in the dashboard (the backend already allows the edit while pending), the rejected state and "Fix and resubmit" (NS-06), in-app notifications (NS-10), and "the owner adds a branch" after approval: a second branch still needs the `multi_branch` plan feature, so E2E checks the prepared branch instead.
- **Done when:**
  - Pest covers the edge cases above, the emails and the clean-up command.
  - E2E covers register → verify → status page → admin approves → owner adds a branch.
  - The security review passes, because this is a public authentication surface.

## NS-30: Barber approval queue

- **Guards:** admin.
- **Story:** a barber who signed up in the stylist app is reviewed by the platform team, approved or rejected with a reason, and told by email. Today nobody can approve them once Filament is gone ([audit §1](09-audit-registration-and-errors.md#1-how-each-account-type-joins-today)).
- **Backend: Partial.**
  - `POST /admin/barbers/{barber}/activate|deactivate` exists on `admin_api` only. Add dashboard routes for:
    - the pending list;
    - approve and reject with a reason: add a `rejected` case to `BarberStatusEnum` ([D8](01-decisions.md#d8-rejecting-and-suspending-a-brand-and-rejecting-a-barber)). A rejected barber fixes the profile and resubmits to `pending`, up to **3** times. `disabled` keeps its post-approval meaning.
  - Lock the row for each transition.
  - Add approval and rejection emails, in en and ar.
  - **Sign-up hardening** in `Barber/Http/Requests/Barber/RegisterRequest.php`:
    - normalise the phone (as the client request does) and add a unique rule, because a duplicate phone is likely a 500 today;
    - treat a banned email the same way as the client rule;
    - send the same generic answer for a pending re-registration as NS-03.
- **Dashboard:** an admin "Barber approvals" queue: the pending list, a detail view (profile and portfolio), approve or reject with a confirmation, and the queue count in the menu.
- **Stylist app (same task):** the pending state explains the review. The new `rejected` status shows its reason and a resubmit action, and an unknown status value never crashes the app.
- **Done when:**
  - Pest covers the transitions, the lock, the resubmission cap, the emails, the duplicate phone and the banned email.
  - E2E covers approving a seeded pending barber.
  - `melos run verify` passes if the app changes.

### NS-30 as built

- **Backend:** `BarberStatusEnum::Rejected`; migration `2026_11_10_000001` adds `rejection_reason`, `reviewed_at`, `submission_count` (default 1) to `barbers`. `BarberReviewService` approves, rejects and resubmits under `lockForUpdate`; approval also writes an activation log. Approval and rejection emails (`BarberApproved`, `BarberRejected`, en and ar) go out after the transaction. Admin routes under `/dashboard/admin`: `GET /barbers`, `GET /barbers/{barber}`, `PATCH /barbers/{barber}/approve|reject`, gated by the `review-barbers` ability (platform admin only; a named gate because `BarberModel` already carries the branch activation policy).
- **Sign-up hardening:** the barber phone is normalised and unique, and a banned email follows the client rule. The generic "check your email" answer for a repeat sign-up is **not** applied: the stylist app expects the `{token, barber}` answer, so changing it needs a mobile contract change (left for a later task).
- **Resubmission:** a rejected barber's login answers 403 `ACCOUNT_REJECTED` with the admin's reason. `POST /barber/resubmit` takes the email and password (a rejected barber holds no token) plus optional `name`, `bio` and `phone` fixes, returns the account to `pending` and counts the submission; the third submission is the last (409 `barber_resubmission_limit`). `EnsureBarberAccountAccess` treats `rejected` like `pending` for the `approved` scope. `BarberResource` gains `rejection_reason` and `submission_count`.
- **Dashboard:** admin "Barber approvals" at `/dashboard/admin/barber-approvals` (pending by default, status and search in the URL), a detail dialog with the portfolio, approve behind a confirmation, reject with a required reason, and the pending count next to the menu entry (`usePendingBarberCount`, `NavQueueCount`).
- **Stylist app:** unchanged. It already shows the server message on a refused login, so a rejected barber sees the reason; a dedicated resubmit screen that calls `POST /barber/resubmit` is not built yet.
- **Tests:** none added, by the product owner's instruction for this batch; the "Done when" test items stay open.

## NS-04: Admin users

- **Guards:** admin.
- **Story:** the platform team adds a colleague, edits or deactivates them, and never has to share one account.
- **Backend: New.** The `admins` table exists, but no API manages it. Required pieces:
  - list, invite (the colleague sets their password through the NS-01 reset link), edit and deactivate;
  - an admin can't deactivate themselves or the last active admin.
- **Dashboard:** an "Admins" screen under Settings.
- **Done when:**
  - Pest covers the last-admin and self-deactivation guards.
  - The security review passes.
  - E2E covers invite and deactivate.

### NS-04 as built

- **Backend:** migration `2026_11_10_000002` adds `admins.deactivated_at`. `AdminUserService` invites (random password plus the NS-01 reset link, so the colleague sets their own), edits, deactivates, reactivates and resends the invitation. Deactivation runs under a row lock, refuses yourself (409 `admin_self_deactivation`) and the last active admin (409 `admin_last_active`), and deletes every token the admin holds. A deactivated admin cannot sign in, reset a password, use an existing token (`DashboardAuthorizationMiddleware`) or open Filament. Routes under `/dashboard/admin/admins`, behind the `manage-admin-users` ability; the resend route is throttled to 5 per minute.
- **Dashboard:** "Admins" at `/dashboard/admin/admins` (a menu entry beside Settings): search and status filter in the URL, invite and edit dialog, deactivate or reactivate behind a confirmation (the backend guard message is toasted on a 409), and resend invite. The row of the signed-in admin hides Deactivate.
- **Invitation email:** it reuses the password-reset mail. A dedicated "you were invited" copy is a later wording task.
- **Tests:** none added, by the product owner's instruction for this batch; the "Done when" test items stay open.

