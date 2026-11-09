---
nodeid: docs.next_steps.phase_1
parentnode: docs.next_steps
childnodes: []
codeanchors:
  - backend/modules/Dashboard/
  - backend/modules/Brand/
  - backend/modules/Admin/
  - frontend/web/dashboard/src/
---

# Phase 1: Nobody Is Locked Out

Routes: [index](index.md) · [decisions](01-decisions.md).

Without these tasks, someone can't get in, can't get back in, or can't be added at all. Each one is a launch blocker.

## NS-01: Password recovery on every login

- **Guards:** admin, manager, owner, barber.
- **Story:** someone who forgot their password asks for a reset link on the login page and sets a new password, without contacting anyone.
- **Backend: New.** The dashboard API has only `/login` and `/refresh`, with no forgot or reset route.
  - Reset-token tables already exist for each account type (`password_reset_tokens_admins`, `_branches`, `_clients`, `_barbers`).
  - The mobile forgot and reset actions for client, branch and barber can be reused behind a dashboard route.
  - Admins have no reset route at all.
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

## NS-03: Owner self-registration and first brand

- **Guards:** a new owner (not yet signed in); the admin, who approves in the existing queue.
- **Story:** a shop owner registers their business on the web and waits for approval. Once approved, they sign in and add branches.
- **Needs:** [D2](01-decisions.md#d2-how-a-new-brand-owner-joins). This section assumes the recommended option (a).
- **Backend: New.**
  - Add a public, throttled registration route. It creates the client account and calls the existing create-brand handler: `CreateBrandRequest` already takes a name, currency, logo, description, universe and optional `first_branch`. The brand is created pending.
  - Decide how email verification fits. The client account already has a verify flow on mobile.
  - Confirm that the dashboard login accepts an owner whose only brand is pending, so they see the waiting state that already exists.
- **Dashboard:**
  - a registration page linked from the owner login;
  - a "submitted, waiting for approval" result;
  - the existing branch "waiting for approval" notice.
- **Done when:**
  - Pest covers registration, the duplicate email, throttling, and a brand created as pending.
  - E2E covers register → admin approves → owner adds a branch.

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
