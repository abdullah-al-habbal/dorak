---
nodeid: docs.readiness
parentnode: docs.graph
childnodes:
  - docs.readiness.t01
  - docs.readiness.t02
  - docs.readiness.t03
  - docs.readiness.t04
  - docs.readiness.t05
  - docs.readiness.t06
  - docs.readiness.t08
  - docs.readiness.t09
  - docs.readiness.t10
  - docs.readiness.t11
  - docs.readiness.t12
  - docs.readiness.t13
  - docs.readiness.t14
  - docs.readiness.t15
  - docs.readiness.t16
codeanchors:
  - backend/
  - frontend/web/dashboard/
  - frontend/mobile/
---

# Release readiness plan

Tracks the work from the read-only readiness audit (2026-11-18): store blockers, legal and public pages, a shared
feedback system, account deletion for every actor, and privacy hardening. One file per task; tick the subtask boxes
as they land and update the status here. Each task is one local commit (`type(scope): ... (T<n>)`), never pushed.

Status values: `todo`, `in progress`, `done`, `blocked`, `skipped`.

## Decisions and assumptions (owner-confirmed 2026-11-18 unless marked)

1. Legal text is placeholder until the owner supplies approved wording.
2. T7 (branch account deletion) is skipped: branch accounts are created by an owner or admin, never self-registered.
3. Feedback accepts guests from the public web form and signed-in users from the apps.
4. Push stays optional: the apps must run without Firebase config (T1.6).
5. `url_launcher` and `package_info_plus` are approved for T8.4 and are the only new mobile dependencies.
6. Geolocator: the iOS location strings stay in all three apps as they are.
7. **Brand owners are supported natively in `business_app`** (T14 to T16): login and management of their brand and branches.
   Owner **registration stays on the web** (`/register/business`, email code and admin approval); the app links to it.
   Assumption to confirm: "full authentication" means login, logout, password reset and session handling, not sign-up.
8. Git guardrail: uncommitted changes that predate a task are never reverted or staged by it; each task stages only its own files.

## Tasks, in implementation order

| Task | Title | Phase | Depends on | Status |
|---|---|---|---|---|
| [T1](t01-mobile-release-config.md) | Mobile release configuration | 1 Blockers | none | done |
| [T2](t02-backend-legal-pages.md) | Backend legal pages and public SEO | 2 Legal pages | none | done |
| [T3](t03-dashboard-legal-content.md) | Dashboard legal content management | 2 Legal pages | T2 | done |
| [T4](t04-backend-feedback.md) | Backend feedback system | 3 Feedback | none | done |
| [T5](t05-dashboard-support-inbox.md) | Dashboard support inbox | 3 Feedback | T4 | done |
| [T6](t06-barber-account-deletion.md) | Barber account deletion (backend) | 4 Deletion | none | done |
| [T7](t07-branch-account-deletion.md) | Branch account deletion | 4 Deletion | confirmed | skipped |
| [T14](t14-owner-mobile-backend-api.md) | Brand owner mobile API (backend) | 5 Owner mobile | none | todo |
| [T8](t08-mobile-shared-layer.md) | Shared mobile layer | 6 Mobile | T2, T4 | todo |
| [T15](t15-owner-mobile-core-layer.md) | Brand owner core layer (`packages/core`) | 6 Mobile | T14, T8 | todo |
| [T9](t09-mobile-app-integration.md) | App integration (client, stylist, business) | 6 Mobile | T6, T8 | todo |
| [T16](t16-business-app-owner-experience.md) | `business_app` brand owner experience | 6 Mobile | T9, T14, T15 | todo |
| [T10](t10-public-barber-resource.md) | Public barber resource (BG-4) | 7 Hardening | none | todo |
| [T11](t11-privacy-checks.md) | Privacy and security checks | 7 Hardening | none | todo |
| [T12](t12-dashboard-web-hygiene.md) | Dashboard web hygiene | 7 Hardening | none | todo |
| [T13](t13-docs-and-gates.md) | Docs and full gates | 8 Close-out | all | todo |

Execution order is the table order. T14 to T16 were added on 2026-11-18 after the owner-mobile audit found no owner surface on mobile.

## Evidence from the audit

Findings that motivate each task (file paths verified on 2026-11-18):

- Android: only `src/debug` and `src/profile` manifests declare `INTERNET`; release signing uses the debug config
  (`apps/*/android/app/build.gradle.kts:32`); app labels are `client_app`, `business_app`, `stylist_app`.
- iOS: display name "Client App"; no usage strings for `client_app` and `business_app`; no `PrivacyInfo.xcprivacy`.
- Firebase initialised in `packages/core/lib/src/notifications/push_notification.client.dart:38`; no Firebase config files.
- Client deletion exists (`backend/modules/Client/Services/ClientAccountDeletion.php`, `client.php:48`); barber and branch have none.
- No privacy, terms, about, contact or delete-account pages; `Website` routes are `/`, `/features`, `/pricing` only.
- No feedback or bug-report system. Public site has no canonical, hreflang, Open Graph or sitemap; `public/robots.txt` allows all.
- BG-4: public barber resource leaks personal fields (backlog section 2).
- Dashboard: only `reset-password` is `noindex`; Playwright runs Chromium only.
- Owner mobile audit: an owner is a client account (ADR 0001); `/client/login` already gives a bearer token, but every owner and brand
  operation sits behind `X-Dashboard-Session` (`DashboardAuthorizationMiddleware`). Precedent for the fix: `Dashboard/Routes/Api/V1/mobile.php`
  reuses dashboard Actions for branch and barber bearer tokens through `MobileDashboardActorMiddleware`. `business_app` today logs in
  branch accounts only (`/branch/login`) and has no register screen.

## Unverified

Current Google Play and App Store policy details were not checked against official sources. Re-verify before submission.
