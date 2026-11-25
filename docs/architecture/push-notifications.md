---
nodeid: docs.push-notifications
parentnode: docs.architecture
childnodes: []
codeanchors:
  - backend/modules/Core/Services/FcmNotificationSender.php
  - backend/modules/Core/Services/DeviceTokenService.php
  - backend/modules/Core/Services/FcmPayloadBuilder.php
  - backend/modules/Core/Http/Actions/Shared/RegisterDeviceTokenAction.php
  - frontend/mobile/packages/core/lib/src/notifications/
  - frontend/mobile/apps/client_app/android/app/build.gradle.kts
---

# Push notifications (FCM): state, contract and setup

Routes: [architecture](architecture.md) · [localization of machine keys](localization-of-machine-keys.md) · [backlog](../backlog/index.md) · [dev environment status](../deployment/dev-environment-status.md)

This page records **what exists, what was verified, and what is still open** for push notifications, so a person or an AI agent can resume without re-auditing. It is dated: when it and the code disagree, the code wins and this page should be re-dated. **No secret value appears here and none must be added** (names of keys and files only).

Written 2026-11-23 21:55 UTC, **re-dated 2026-11-26**. Phase 1 is on the dev environment (released 2026-11-23, see section 5). Phase 2 code is complete and committed (backend P2.1 and P2.2, dashboard P2.4 `350f4f937`); the backend part is not deployed to dev. When this was written, before the push the owner requested on 2026-11-26, `origin/master` was at `6ab921c87` and local `master` held the Phase 2 commits plus the mobile analyzer commits; run `git log origin/master..HEAD` for the current count. A handover for the earlier session is in [handover-push-phase-2](../sessions/handover-push-phase-2.md); the Phase 2 state is section 8 of this page.

## 1. Phased programme and status

| Phase | Scope | Status |
|---|---|---|
| 1 | Core push: device-token API, per-device locale, bilingual payload, Flutter FCM in all three apps | **Done and released to dev** on 2026-11-23 (deploy run `45277277114`, `reset_database=true`); real delivery waits on RR-16 |
| 2 | Dashboard browser push (service worker, permission UX, web token) | **Code complete** (P2.1 `aa144ecbe`, P2.2 `4897540c0`, P2.4 `350f4f937`); backend not deployed to dev; real delivery not verified (RR-16). Details in section 8 |
| 3 | Analytics and domain events (privacy-safe taxonomy, Firebase Analytics, audit events) | Not started |
| 4 | Firebase App Distribution and multi-recipient release email (SMTP Hostinger) | Not started |

Commits of the programme, oldest first:

| SHA | Subject | On `origin/master` |
|---|---|---|
| `46e1d3f39` | `feat(core): device token locale, app version and revocation API (Push P1.1)` | yes |
| `f7e208176` | `feat(core): per-device bilingual FCM payload with android and apns settings (Push P1.2)` | yes |
| `1ab76c269` | `feat(mobile): complete FCM wiring with dev/prod flavors and fail-safe Firebase setup (Push P1.3)` | yes |
| `cada10f95` | `docs: record push notification state, contract, setup and open items (Push P1.4)` | yes |
| `fea9c09fd` | `fix(core): revoke device tokens on deletion, password change, ban, deactivation (Push P1.5)` | yes |
| `6ab921c87` | `docs(deployment): snapshot 8, push phase 1 released to dev; close RR-17 (Push P1.6)` | yes |
| `aa144ecbe` | `feat(core): dashboard web push token API and web push payload (Push P2.1)` | in the 2026-11-26 push |
| `4897540c0` | `fix(core): keep browser push tokens when a password change keeps the current sign-in (Push P2.2)` | in the 2026-11-26 push |
| `c24afed57` | `docs: record push state, Phase 2 decisions, configs and URLs (Push P2.3)` | in the 2026-11-26 push |
| `350f4f937` | `feat(core): dashboard browser push with FCM web (Push P2.4)` | in the 2026-11-26 push |

## 2. Backend contract

### Tables (`Modules\Core`)

- `device_tokens` (migration `2026_09_30_000010_create_device_tokens_table.php`, **edited in place** under the dev migration rule, with a `// @contract-migration:` waiver so `php scripts/check_migrations.php` passes): `id`, `user_id`, `user_type` (morph alias `client`/`barber`/`branch`/`admin`), unique `token`, `platform_type` (`android`/`ios`/`web`), **`locale`** (`ar`/`en`, nullable), **`app_version`** (max 32, nullable), **`access_token_id`** (the Sanctum token the device signed in with, nullable, indexed), `last_used_at`, **`revoked_at`** (nullable).
- `notifications` (inbox, unique `dedupe_key`) and `notification_deliveries` (one row per device attempt) are unchanged.

### Endpoints

| Method and path | Auth | Behaviour |
|---|---|---|
| `POST /api/v1/user/device-token` | `auth:client,barber,branch_api,admin_api` | Body `token`, `platform_type`, optional `locale` (`ar`/`en`), optional `app_version`. Idempotent: the unique token is `updateOrCreate`d, a parallel insert is retried, `revoked_at` is cleared, and the row is linked to the current Sanctum token. A token registered by another account **moves** to the caller (a token proves one physical install). Returns `data.id`. |
| `DELETE /api/v1/user/device-token` | same | Body `token`. Unknown token: success (idempotent). Another account's token: `403` through `DeviceTokenPolicy::revoke`. Sets `revoked_at`. |

| `POST /api/v1/dashboard/push-token` | dashboard session (`DashboardAuthorizationMiddleware`), any actor: admin, owner, branch, barber | Body `token`, optional `locale`, `app_version`. Platform is always `web`; the row is **not** linked to an API token (dashboard access tokens rotate on refresh). Registers for the signed-in account only. |
| `DELETE /api/v1/dashboard/push-token` | same | Body `token`. Unknown token: `200`; another account's token: `403` (`DeviceTokenPolicy::revoke`). |

Dashboard logout (`POST /dashboard/logout`) accepts an optional `push_token` and revokes it when it belongs to the account. A web device gets an FCM `webpush` payload (TTL and urgency headers, `lang` and `dir` from its locale) and no android or apns block. Both routes are on the self-account write exemption list. Ban, deactivation and deletion revoke web tokens. A password change that **keeps the current sign-in** (the dashboard's own change) also keeps web tokens, because they carry no access token to match (Push P2.2, `4897540c0`); a reset that keeps no sign-in revokes them. Trade-off: the account's other browsers keep push after a password change made from the dashboard.

Revocation also happens **on logout** of the client, barber and branch guards (`DeviceTokenService::revokeForAccessToken`): only the devices that signed in with the logged-out API token stop receiving pushes; other sign-ins keep theirs. Account deletion (client and barber) erases the account's device tokens; password change and reset, bans, admin deactivation and the dashboard credential revoker revoke them (`DeviceTokenService::revokeAllForAccount` / `deleteAllForAccount`, Push P1.5; tests in `tests/Feature/Core/DeviceTokenAccountLifecycleTest.php`). The dashboard logout revokes only the one web token sent as `push_token` (above); a browser whose storage was cleared keeps its row until a ban, deactivation, a reset or an FCM `UNREGISTERED` answer removes it.

### Sending (`FcmNotificationSender`, kept as the direct HTTP v1 client)

- `sendMessage(userType, userId, type, LocalizedNotificationMessage, data, dispatchKey)` is the entry point; `sendTo(...)` stays for already-written text.
- **Language rule.** The inbox row is written in the recipient's stored `preferences.preferred_language`; each device push is written in that device's registered `locale`, falling back to the account language. The request that raised the event belongs to another actor, so its locale is never used. All eleven senders (booking, review request, affiliation invite/response, job application received/status) use `LocalizedNotificationMessage::translated(titleKey, bodyKey, params)`. The jobs still accept a `$locale` constructor argument for dispatcher compatibility; it is now unused (clean-up candidate).
- **Payload** (`FcmPayloadBuilder`): `notification{title,body}`, string-only `data`, `android{priority HIGH, ttl 86400s, notification{channel_id dorak_default, sound default}}`, `apns{headers{apns-priority 10, apns-push-type alert}, payload.aps.sound default}`. Constants live in `FcmPayloadConstants`.
- Revoked tokens are skipped; tokens FCM reports `UNREGISTERED` (or a bad-token `INVALID_ARGUMENT`) are deleted; 429 and 5xx retry; the dispatch key keeps a retried job from re-sending to a device that already received it.
- **Fail-safe.** With `services.fcm.project_id` or credentials missing, the sender logs one warning (reason only) and still writes the inbox row.

### Configuration keys (names only)

| Key | Where | Meaning |
|---|---|---|
| `FCM_PROJECT_ID` | backend `.env` (`config('services.fcm.project_id')`, `modules/Core/Config/services.php`) | Firebase project id. Use the **dev** project on local and dev, the **prod** project only on prod. |
| `FCM_CREDENTIALS` | backend `.env` | Absolute path to the service-account JSON **outside the repository**, or the inline JSON. Never commit it. |

Both are documented in `backend/.env.example` (empty by default). `QUEUE_CONNECTION` must run a worker on Hostinger (RR-8: the cron entries for `schedule:run` and `queue:work` were not confirmed), otherwise queued pushes are not sent.

**Not edited by this work:** `backend/.env` and `backend/.env.testing`. The session's permission settings deny reading them even though the owner allowed edits. The test suite does not need them (`phpunit.xml` forces the test database; the queue is sync, FCM keys are unset so the sender takes the fail-safe path, and the tests fake HTTP). To enable push locally, add the two keys above to `backend/.env` by hand.

## 3. Mobile contract (`frontend/mobile`)

- **`PushNotificationService`** (`packages/core/lib/src/notifications/push_notification.client.dart`): `initialize()` is safe to call repeatedly and after sign-in. Order: initialise Firebase (fails safe when the config files are absent) → register the background handler (`PushBackgroundHandler.handle`), prepare the foreground presenter, listen to taps and read the launch notification → ask for permission **once** (a user who declined is not asked again) → register the token. `registerToken` sends `token`, `platform_type`, `locale` (from the app's locale resolver) and `app_version` (from `AppInfoProvider`, e.g. `1.4.2+7`); empty values are omitted. `refreshRegistration()` re-sends the token after a language switch. `stop()` cancels every subscription.
- **Foreground display:** `ForegroundNotificationPresenter` (abstract) with `LocalForegroundNotificationPresenter` on `flutter_local_notifications` ^23.0.4, channel `dorak_default` (the same id the backend names). The dependency was added with this task and recorded in `packages/core/CLAUDE.md`.
- **Apps:** `client_app` now registers the device **after sign-in** (before this it only tried at start-up as a guest and never retried), `business_app` and `stylist_app` already initialised after sign-in; all three pass the locale resolver and call `refreshRegistration()` when the language is toggled.
- **Deep links:** unchanged (`NotificationTarget` and `NotificationLocation`). FT-2 (invites open `/affiliations`, applicants open `/jobs/:id/applicants`) is **still open**.

### Android flavors and Firebase files

Each app has the flavors `dev` (application id `<id>.dev`, version suffix `-dev`) and `prod`; `flutter: default-flavor: dev` in each `pubspec.yaml` keeps plain `flutter run` working. The `google-services` Gradle plugin is applied **only when the file for the requested flavor exists**, so a checkout without Firebase files builds and runs without push.

| File (git-ignored) | Firebase project |
|---|---|
| `frontend/mobile/apps/<app>/android/app/src/dev/google-services.json` | dev |
| `frontend/mobile/apps/<app>/android/app/src/prod/google-services.json` | prod |
| `frontend/mobile/apps/<app>/ios/Runner/GoogleService-Info.plist` | per Xcode scheme (manual, see below) |

`.gitignore` already excludes `**/google-services.json`, `**/GoogleService-Info.plist`, keystores, `key.properties`, and now `**/firebase_options.dart`. Build commands: dev `flutter build apk --flavor dev`, prod `flutter build apk --release --flavor prod`. `mobile-ci.yml` now builds `--flavor dev` and uploads `app-dev-release.apk`.

iOS: `UIBackgroundModes: remote-notification` is set in each `Info.plist`. **Manual, not done** (needs Xcode on a Mac): the Push Notifications capability and `aps-environment` entitlement, the APNs key in the Firebase console, Xcode schemes per flavor with the matching plist, and the placeholder Google client id (RR-5).

## 4. Verification record (2026-11-23, local)

| Gate | Result |
|---|---|
| Backend Pest, whole suite, sequential (`php -d memory_limit=-1 vendor/bin/pest`) | **2964 passed** (13397 assertions) after P1.2 |
| `vendor/bin/pint --test` | passed |
| `php scripts/check_migrations.php` | passed (1 migration checked, 1 waived) |
| `php artisan migrate:fresh --seed` (local database) | ran, seeders finished |
| Mobile `dart run melos run verify` | passed (analyze, taxonomy, tests in all apps and packages) |
| `scripts/check-conventions.sh`, `git diff --check` | passed |
| Dashboard gates, Playwright | not run: no dashboard file changed; Playwright skipped on the owner's instruction |
| Android build (`flutter build apk --debug --flavor dev`) | **not verified**: the local NDK `/home/lenovo/Android/Sdk/ndk/28.2.13676358` has no `source.properties` (malformed download), so Gradle stops before reaching the app code. Delete that NDK folder and let Gradle re-download it, then re-run the build. The Gradle changes are therefore unproven on a device. |
| Real push delivery | **not verified**: no Firebase project, config files or service account exist yet |

New tests: `tests/Feature/User/DeviceTokenRegistrationTest.php` (locale/version, validation, auth, revoke, ownership, token moves, logout revokes only that sign-in), `tests/Unit/Core/Services/FcmNotificationSenderTest.php` (revoked skipped, per-device language, android/apns blocks, inbox in the recipient language), and `packages/core/test/push_notification_service_test.dart` (registration payload).

## 5. Environments and URLs

| Item | Value |
|---|---|
| Repository | `https://github.com/abdullah-al-habbal/dorak` (branch `master`; local commits ahead of `origin/master`) |
| Dev backend (Hostinger) | `https://dev-dorak-backend.io` (health `https://dev-dorak-backend.io/api/v1/health`) |
| Dev dashboard (Vercel) | `https://dorak-bay.vercel.app` |
| Deploy workflow | `.github/workflows/deploy.yml`, manual `workflow_dispatch`, input `reset_database` (default false); release helper `scripts/release-dev.sh`, check `scripts/verify-deploy.sh` |
| FCM endpoint | `https://fcm.googleapis.com/v1/projects/<FCM_PROJECT_ID>/messages:send` (OAuth via `https://oauth2.googleapis.com/token`) |
| Test database | MySQL 8.4 `dorak-test-db-mysql-1`, `127.0.0.1:3307`, `dorak_test` (`composer test:db:up`) |

**Dev database reset: done.** The `device_tokens` create migration was edited in place, so the dev database was rebuilt once: `scripts/release-dev.sh --reset-database` on 2026-11-23 (deploy run `45277277114`, success; `scripts/verify-deploy.sh` all PASS). That authorisation is used up; production is never reset. Phase 2 changed **no migration** (`php scripts/check_migrations.php`: no migration changed), so its release uses `reset_database=false`.

## 6. What the owner must provide to turn push on

1. Two Firebase projects (dev and prod) with Android apps `com.dorak.client_app(.dev)`, `com.dorak.business_app(.dev)`, `com.dorak.stylist_app(.dev)` (check the exact ids in each `build.gradle.kts`); download each `google-services.json` into the matching `src/<flavor>/` folder.
2. One service-account JSON per environment; set `FCM_PROJECT_ID` and `FCM_CREDENTIALS` on the server (Hostinger `shared/.env`, mode 600) and locally.
3. The APNs key uploaded in Firebase and the iOS capability (Mac only).
4. A running queue worker and scheduler on Hostinger (RR-8).

## 7. Decisions for the next phases (recorded 2026-11-23)

- Keep the direct HTTP v1 sender; no heavy third-party push package.
- Phase 4 email: **SMTP (Hostinger)**; recipient lists in a **GitHub Environment variable**, SMTP credentials in **GitHub Environment secrets**. Firebase App Distribution tester groups and the Firebase service account go in the same environment; nothing in the repository.
- Dev and prod Firebase configuration stay separate per flavor so dev testing never reaches production.
- Playwright stays skipped unless the owner asks.
- Phase 2 may reuse `device_tokens` (`platform_type=web` already exists in `DevicePlatformEnum`) by editing the same create migration, or add a new table only if a separate shape is needed.
- Phase 3 audit events would be a new table (the only case that justifies a new migration file).

## 8. Phase 2: dashboard browser push (state on 2026-11-26)

**Decisions (owner, 2026-11-25).** Roles: browser push for every dashboard actor (admin, owner, branch manager, barber), each scoped to its own account, switched on and off from the account notification settings. Mechanism: lightweight Web Push through FCM Web with a VAPID public key and `public/firebase-messaging-sw.js`; the backend sender stays on FCM HTTP v1 with no extra push package. With any web Firebase or VAPID variable missing the dashboard degrades silently (no toggle action, no crash, no request) until RR-16 is configured. Playwright stays skipped. An owner is a `ClientModel`, so an owner's web token has `user_type = client` and shares pushes with that person's mobile devices (confirm this is wanted: BG-37).

### Backend (committed)

| Item | Where |
|---|---|
| Register and revoke a browser token | `POST` and `DELETE /api/v1/dashboard/push-token` (section 2), `modules/Dashboard/Http/Actions/Push/`, requests in `modules/Dashboard/Http/Requests/Push/` |
| Logout revokes the stored token | `LogoutAction` accepts optional `push_token` |
| Web payload | `FcmPayloadBuilder::build(..., $locale, $platform)`: for `web` only `data` plus `webpush` (TTL and urgency headers, `notification` with `title`, `body`, `lang`, `dir`) |
| Password-change rule | `DeviceTokenService::revokeAllForAccount` keeps web rows when a sign-in is kept (`4897540c0`) |
| Tests | `tests/Feature/Dashboard/DashboardPushTokenTest.php` (4), `tests/Unit/Core/Services/FcmNotificationSenderTest.php`, `tests/Feature/Core/DeviceTokenAccountLifecycleTest.php` (5) |

### Dashboard (committed, `350f4f937`, `frontend/web/dashboard/`)

`public/firebase-messaging-sw.js` (plain worker, no Firebase code); `src/config/push/web-push.constant.ts`; `src/types/push/`; `src/schemas/push/`; `src/schemas/core/session/logout-body.zod.ts`; `src/lib/push/` (config, support, token storage, enable and disable flow in `browser-push-flow.util.ts`, and `firebase-web-push.util.ts`, the only file that imports Firebase, on demand); `src/services/api/mutation/push/push-token.mutation.ts`; `src/hooks/account/notifications/use-browser-push.ts`; `src/components/account/notifications/browser-push-row.tsx`; proxy allow-list entries for `push-token`; logout forwards `push_token`; English and Arabic strings; tests in `tests/lib/push/`, `tests/components/account/browser-push-row.test.tsx` and `tests/config/proxy-allow-list.constant.test.ts`.

Behaviour: with any of the five values missing the row is not rendered and Firebase is not imported. The browser stores `{ token, owner }`, and the switch reads "on" only for the account that registered it. A failed sign-out keeps the stored token. The hook does not use `useOptimisticToggleMutation` or `useFeedbackMutation`: the change is a browser permission and registration sequence with no query cache to patch or invalidate.

**Dependency (BD-14, resolved):** `firebase` pinned at `12.0.0`. The package also installs `@firebase/firestore`, which depends on `@grpc/grpc-js` with high-severity advisories (BG-38). The dashboard does not import Firestore, and no gRPC or Firestore code was found in the built browser chunks.

### Configuration (names only; no value belongs in the repository)

| Name | Where | Meaning |
|---|---|---|
| `NEXT_PUBLIC_FIREBASE_API_KEY`, `NEXT_PUBLIC_FIREBASE_PROJECT_ID`, `NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID`, `NEXT_PUBLIC_FIREBASE_APP_ID`, `NEXT_PUBLIC_FIREBASE_VAPID_KEY` | Vercel environment of the dashboard (listed, commented out, in `frontend/web/dashboard/.env.example`) | Firebase **web app** config and the VAPID public key. All five must be set, else the browser-push row stays inert. Public by design; changing them needs a redeploy |
| `FCM_PROJECT_ID`, `FCM_CREDENTIALS` | backend `.env` (section 2) | Server side sending; unchanged |

### Verification record

| Gate | Result |
|---|---|
| Backend Pest, whole suite, sequential (2026-11-25) | **2974 passed** (13449 assertions) at `4897540c0`; not rerun on 2026-11-26 (no backend file changed since) |
| `vendor/bin/pint --test`, `php scripts/check_migrations.php` (2026-11-25) | passed; no migration changed in Phase 2 |
| Dashboard lint, typecheck, Vitest (1243 tests in 226 files), production build (2026-11-26) | passed |
| `scripts/check-conventions.sh` (task executor), `git diff --check` (2026-11-26) | passed |
| `web-design-guidelines` on the new row (2026-11-26) | one finding fixed (`aria-live` on the changing hint) |
| Security review, source only, of the push routes, proxy rule, logout, worker, stored token and dependency (2026-11-26) | no authorization defect found; the account mix-up in the stored state and the token lost on failed sign-out were fixed before commit; BG-37 and BG-38 remain |
| `npm audit --omit=dev` (2026-11-26) | 4 high through Firestore (BG-38), 4 moderate through `shadcn` |
| Playwright | skipped on the owner's instruction |
| Real browser delivery, service worker payload shape | **not verified** (no Firebase web config, RR-16) |

### Known open points (backlog)

BD-15 (the `allows_push_notifications` switch: **nothing in `FcmNotificationSender` reads it**, verified 2026-11-25; its hint says "phones and browsers"), BG-37 (browser push behaviour still to verify or decide), BG-38 (advisories installed with `firebase`), RR-16 (Firebase web app and VAPID key).
