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

Written 2026-11-23 21:55 UTC (2026-11-24 00:55 +03). Work done locally on `master`; **nothing pushed, nothing deployed** (the owner asked for local commits only).

## 1. Phased programme and status

| Phase | Scope | Status |
|---|---|---|
| 1 | Core push: device-token API, per-device locale, bilingual payload, Flutter FCM in all three apps | **Done locally** (three commits below); the dev deploy with `reset_database=true` is **authorised but not run** |
| 2 | Dashboard browser push (service worker, permission UX, web token) | Backend done locally (P2.1); dashboard slice in progress |
| 3 | Analytics and domain events (privacy-safe taxonomy, Firebase Analytics, audit events) | Not started |
| 4 | Firebase App Distribution and multi-recipient release email (SMTP Hostinger) | Not started |

Phase 1 commits (all local):

| SHA | Subject |
|---|---|
| `46e1d3f39` | `feat(core): device token locale, app version and revocation API (Push P1.1)` |
| `f7e208176` | `feat(core): per-device bilingual FCM payload with android and apns settings (Push P1.2)` |
| `1ab76c269` | `feat(mobile): complete FCM wiring with dev/prod flavors and fail-safe Firebase setup (Push P1.3)` |

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

Dashboard logout (`POST /dashboard/logout`) accepts an optional `push_token` and revokes it when it belongs to the account. A web device gets an FCM `webpush` payload (TTL and urgency headers, `lang` and `dir` from its locale) and no android or apns block. Both routes are on the self-account write exemption list. Password change, reset, ban and deactivation revoke web tokens too.

Revocation also happens **on logout** of the client, barber and branch guards (`DeviceTokenService::revokeForAccessToken`): only the devices that signed in with the logged-out API token stop receiving pushes; other sign-ins keep theirs. Account deletion (client and barber) erases the account's device tokens; password change and reset, bans, admin deactivation and the dashboard credential revoker revoke them (`DeviceTokenService::revokeAllForAccount` / `deleteAllForAccount`, Push P1.5; tests in `tests/Feature/Core/DeviceTokenAccountLifecycleTest.php`). The dashboard (admin/owner) logout does not touch device tokens (web push is Phase 2).

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

**Dev database reset.** Because the `device_tokens` create migration was edited, the deployed dev database does not have the new columns until it is rebuilt. The owner authorised `reset_database=true` for this release. Run it once, after the owner pushes: `scripts/release-dev.sh --reset-database`, then `scripts/verify-deploy.sh`. Until then the deployed dev API would fail on `POST /user/device-token` for the new columns, so **do not deploy this code without the reset**.

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
