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
