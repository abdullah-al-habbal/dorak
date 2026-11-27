---
nodeid: docs.push-notifications
parentnode: docs.architecture
childnodes: []
codeanchors:
  - backend/modules/Core/Services/FcmNotificationSender.php
  - backend/modules/Core/Services/DeviceTokenService.php
  - backend/modules/Core/Services/FcmPayloadBuilder.php
  - backend/modules/Core/Http/Actions/Shared/RegisterDeviceTokenAction.php
  - backend/modules/Dashboard/Http/Actions/Push/
  - frontend/web/dashboard/src/lib/push/
  - frontend/mobile/packages/core/lib/src/notifications/
  - frontend/mobile/apps/client_app/android/app/build.gradle.kts
---

# Push notifications (FCM)

Routes: [architecture](architecture.md) · [localization of machine keys](localization-of-machine-keys.md) · [backlog](../backlog/index.md) · [dev environment status](../deployment/dev-environment-status.md)

How push works and how to turn it on. What is deployed or configured is in the dev environment status; open work is
in the backlog. **No secret value belongs here** (names of keys and files only).

## Data

`device_tokens` (`Modules\Core`): `user_id`, `user_type` (`client`, `barber`, `branch`, `admin`), unique `token`,
`platform_type` (`android`, `ios`, `web`), `locale` (`ar` or `en`), `app_version`, `access_token_id` (the Sanctum
token the device signed in with), `last_used_at`, `revoked_at`. The inbox is `notifications`;
`notification_deliveries` records delivery attempts per device.

## Endpoints

| Method and path (under `/api/v1`) | Caller | Behaviour |
|---|---|---|
| `POST /user/device-token` | client, barber, branch or admin API token | `token`, `platform_type`, optional `locale`, `app_version`. Idempotent. Clears `revoked_at` and links the current sign-in. A token held by another account moves to the caller. |
| `DELETE /user/device-token` | same | `token`. An unknown token succeeds; another account's token gets 403 (`DeviceTokenPolicy::revoke`). |
| `POST /dashboard/push-token` | any signed-in dashboard actor | `token`, optional `locale`, `app_version`. Platform is always `web`. Not linked to an API token, because dashboard access tokens rotate. |
| `DELETE /dashboard/push-token` | same | `token`. Unknown token: 200; another account's token: 403. |

`POST /dashboard/logout` accepts an optional `push_token` and revokes it if the account owns it. Both push routes are
exempt from the business write guard, because they touch only the signed-in account's own device.

## When tokens are revoked

| Event | Effect |
|---|---|
| Client, barber or branch API logout | only devices linked to that sign-in |
| Dashboard logout | only the token sent as `push_token` |
| Password change or reset that keeps no sign-in, ban, admin deactivation | all of the account's tokens |
| Password change that keeps the current sign-in | every mobile device not linked to that sign-in; browser (`web`) tokens stay |
| Client or barber account deletion | tokens are erased |

So after a password change made from the dashboard, the account's other browsers keep receiving pushes.

## Sending

- `FcmNotificationSender` calls the FCM HTTP v1 API directly. `sendMessage` takes a `LocalizedNotificationMessage`;
  `sendTo` takes already-written text.
- **Language.** The inbox row uses the recipient's stored language. Each push uses the device's `locale`, falling back
  to the account language. The language of the request that raised the event is never used.
- **Payload** (`FcmPayloadBuilder`, `FcmPayloadConstants`). Android and iOS get `notification`, string-only `data`,
  `android` (channel `dorak_default`) and `apns` blocks. Web gets `data` and `webpush`, whose `notification` carries
  `title`, `body`, `lang` and `dir`.
- Revoked tokens are skipped. A delivery key stops a retried job from sending again to a device that already got the
  message. 429 and server errors are retried.
- A token is **deleted** when FCM answers with an `FcmError` code `UNREGISTERED` or `INVALID_ARGUMENT`, a status
  `UNREGISTERED`, or a status `INVALID_ARGUMENT` whose message mentions the token. Firebase also uses
  `INVALID_ARGUMENT` for payload faults, so the first case can delete good tokens: backlog BG-53.
- **Fail-safe.** Without a project id or usable credentials, the sender logs the reason once per instance and still
  writes the inbox row.

## Configuration (names only)

| Key | Where | Meaning |
|---|---|---|
| `FCM_PROJECT_ID` | backend `.env` | Firebase project id. Use the dev project locally and on dev, the prod project only on prod. |
| `FCM_CREDENTIALS` | backend `.env` | Absolute path to a service-account JSON outside the repository, or the inline JSON. Never commit it. |
| `NEXT_PUBLIC_FIREBASE_API_KEY`, `NEXT_PUBLIC_FIREBASE_PROJECT_ID`, `NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID`, `NEXT_PUBLIC_FIREBASE_APP_ID`, `NEXT_PUBLIC_FIREBASE_VAPID_KEY` | dashboard environment (Vercel; listed in `frontend/web/dashboard/.env.example`) | Firebase web app config and VAPID public key. Public by design. Changing them needs a redeploy. |

## Mobile apps

- `PushNotificationService` (`packages/core/lib/src/notifications/`) initialises Firebase, prepares foreground display
  and tap handling, asks for permission if not yet decided, registers the token and follows token refresh. Any failure
  leaves the app running without push, and a later call may retry.
- It sends the app's language and version, and `refreshRegistration()` re-sends them after a language switch.
- Foreground messages use `flutter_local_notifications`, on the `dorak_default` channel.
- Each app maps a tapped notification to a screen in `notification_location.entity.dart`.
- Android has `dev` (application id suffix `.dev`) and `prod` flavors, and `dev` is the default. The `google-services`
  plugin is applied only when the flavor's file exists, so a checkout without Firebase files builds without push.

| Git-ignored file (under `frontend/mobile/apps/<app>/`) | For |
|---|---|
| `android/app/src/dev/google-services.json` | dev project |
| `android/app/src/prod/google-services.json` | prod project |
| `ios/Runner/GoogleService-Info.plist` | per Xcode scheme |

## Dashboard browser push

- Every dashboard actor can switch browser push on or off for their own account, in the notification settings.
- If any of the five web values is missing, the row isn't shown and Firebase isn't imported.
- `public/firebase-messaging-sw.js` is a plain service worker with no Firebase code. It shows nothing while a
  dashboard tab is focused, and a click focuses or opens the dashboard.
- Only `src/lib/push/firebase-web-push.util.ts` imports Firebase, on demand. The enable and disable flow is in
  `browser-push-flow.util.ts`.
- The browser stores the token with its owner, so the switch reads "on" only for the account that registered it.
  Turning it off revokes on the backend first; if that fails, the stored token is kept.
- A brand owner is a client account, so an owner's browser token has `user_type = client`, like that person's phones.

## Turning push on

1. Create separate dev and prod Firebase projects with the Android apps `com.dorak.client_app`,
   `com.dorak.business_app` and `com.dorak.stylist_app` (dev adds `.dev`). Put each `google-services.json` in place.
2. Create one service account per environment. Set `FCM_PROJECT_ID` and `FCM_CREDENTIALS` on the server (shared
   `.env`, mode 600) and in any local `backend/.env` that should send.
3. For browser push, add a Firebase web app and VAPID key, and set the five dashboard values.
4. For iOS (needs a Mac): add the Push Notifications capability and `aps-environment` entitlement, per-flavor Xcode
   schemes with the matching plist, and upload the APNs key to Firebase. `UIBackgroundModes: remote-notification` is
   already in each `Info.plist`.
5. Run a queue worker and the scheduler on the server. Without a worker, queued pushes aren't sent.

## Decisions

| Date | Decision |
|---|---|
| 2026-11-23 | Keep the direct HTTP v1 sender; no heavy third-party push package. |
| 2026-11-23 | Dev and prod Firebase configuration stay separate. |
| 2026-11-23 | Release email (phase 4): Hostinger SMTP. Recipients in a GitHub Environment variable; SMTP credentials, tester groups and the Firebase service account in that environment, nothing in the repository. |
| 2026-11-23 | Analytics audit events (phase 3) would get their own table. |
| 2026-11-25 | Browser push for admin, owner, branch manager and barber, each for their own account, through FCM Web with a VAPID key and a service worker. Missing configuration degrades silently. |
| 2026-11-26 | BD-14: the dashboard depends on `firebase`, pinned at `12.0.0`, and imports it only when browser push is used. |

## Open work

In the [backlog](../backlog/index.md): FT-21 (phases 3 and 4), FT-2 (job application deep link), FT-20 and BG-12
(reminders), BD-15 (the push preference doesn't stop sends yet), BG-37 (browser behaviour to verify), BG-38 (Firebase
advisories), BG-53 (token deletion), TD-20, RR-8 and RR-16. Real delivery to a phone or browser has not been verified.
