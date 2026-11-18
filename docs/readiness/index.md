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

## Assumptions (change here if the owner says otherwise)

1. Legal text is placeholder until the owner supplies approved wording.
2. Branch account deletion is out of scope (T7) unless `business_app` users can self-register.
3. Feedback accepts guests from the public web form and signed-in users from the apps.
4. Push notifications stay optional: the apps must run without Firebase config (T1.6).
5. New mobile dependencies (`url_launcher`, `package_info_plus`) need owner approval before T8.4.

## Tasks, in implementation order

| Task | Title | Phase | Depends on | Status |
|---|---|---|---|---|
| [T1](t01-mobile-release-config.md) | Mobile release configuration | 1 Blockers | none | todo |
| [T2](t02-backend-legal-pages.md) | Backend legal pages and public SEO | 2 Legal pages | none | todo |
| [T3](t03-dashboard-legal-content.md) | Dashboard legal content management | 2 Legal pages | T2 | todo |
| [T4](t04-backend-feedback.md) | Backend feedback system | 3 Feedback | none | todo |
| [T5](t05-dashboard-support-inbox.md) | Dashboard support inbox | 3 Feedback | T4 | todo |
| [T6](t06-barber-account-deletion.md) | Barber account deletion (backend) | 4 Deletion | none | todo |
| [T7](t07-branch-account-deletion.md) | Branch account deletion (conditional) | 4 Deletion | owner decision | skipped |
| [T8](t08-mobile-shared-layer.md) | Shared mobile layer | 5 Mobile | T2, T4 | todo |
| [T9](t09-mobile-app-integration.md) | App integration (client, stylist, business) | 5 Mobile | T6, T8 | todo |
| [T10](t10-public-barber-resource.md) | Public barber resource (BG-4) | 6 Hardening | none | todo |
| [T11](t11-privacy-checks.md) | Privacy and security checks | 6 Hardening | none | todo |
| [T12](t12-dashboard-web-hygiene.md) | Dashboard web hygiene | 6 Hardening | none | todo |
| [T13](t13-docs-and-gates.md) | Docs and full gates | 7 Close-out | all | todo |

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

## Unverified

Current Google Play and App Store policy details were not checked against official sources. Re-verify before submission.
