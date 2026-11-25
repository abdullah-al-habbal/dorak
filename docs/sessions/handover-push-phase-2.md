# Handover: push programme, Phase 1 release and Phase 2 (dashboard browser push)

Written 2026-11-24 by the executing session. **The next session must review this work independently.** The
author of the code wrote the review notes below, so treat them as leads to check, not as findings. Verify
every claim against the code and the gate output; where this file and the code disagree, the code wins.

> **Status update, 2026-11-25 12:52 UTC (15:52 +03), by the reviewing session.** Since this file was written: `4897540c0` (Push P2.2) fixes weakness 1 (a password change made from the dashboard keeps web tokens); full Pest passes at 2974. `origin/master` is still `6ab921c87`, local `master` is 2 commits ahead. Weakness 4 is **confirmed** (nothing reads `allows_push_notifications` in the sender). The owner's decisions on roles, mechanism and rules were recorded in [push notifications](../architecture/push-notifications.md) section 8. Still waiting for the owner: BD-14 (`firebase` npm package) and BD-15 (the preference switch). The dashboard slice stays uncommitted until BD-14 is answered. Current numbers live in the push page and in [dev environment status](../deployment/dev-environment-status.md) snapshot 9; where they differ from section 1 below, they win.

## 1. State of the repository

| Item | State |
|---|---|
| Branch | `master`, remote `origin` (`abdullah-al-habbal/dorak`) |
| Pushed to `origin/master` | up to `6ab921c87` (Phase 1, the token fix, and snapshot 8 docs) |
| Local only, **not pushed** | `aa144ecbe` feat(core): dashboard web push token API and web push payload (Push P2.1) |
| Uncommitted | the dashboard slice of Phase 2 (see section 4) plus unrelated working-tree changes from other sessions: run `git status` and stage by name |
| Dev environment | Phase 1 deployed with `reset_database=true` on 2026-11-23 (deploy run `45277277114`, Vercel success, `scripts/verify-deploy.sh` all PASS). P2.1 is **not** deployed. |

Commits of this programme, oldest first: `46e1d3f39` P1.1, `f7e208176` P1.2, `1ab76c269` P1.3, `cada10f95` P1.4,
`fea9c09fd` P1.5 (token revocation fix), `6ab921c87` P1.6 (snapshot 8, RR-17 closed), `aa144ecbe` P2.1.

Rules in force: local commits only, **never push unless the owner says so** (the owner authorised one push and
one `--reset-database` dev release on 2026-11-23; that authorisation is used up). Never reset production.
Playwright stays skipped unless the owner asks. Never print secrets. See `CLAUDE.md` and
`.claude/skills/monorepo-task-executor/SKILL.md` (every Dorak task follows it: hygiene cleanup, all gates, local commit).

## 2. What was done

### P1.5 `fea9c09fd`: device tokens on account lifecycle events
- `DeviceTokenService` gained `revokeAllForAccount(Model, keepAccessTokenId = null)` and `deleteAllForAccount(Model)`.
- Called from: `ClientAccountDeletion` (delete; it had no cleanup before), `BarberAccountDeletion` (now uses the service),
  client password change and reset, branch and barber password reset, `BanObserver`, `AdminUserService` deactivation,
  `DashboardCredentialRevoker::revokeOthers`.
- Tests: `backend/tests/Feature/Core/DeviceTokenAccountLifecycleTest.php` (4 tests).

### P1.6 `6ab921c87`: release and docs
- `scripts/release-dev.sh --reset-database` run (the RESET prompt was answered by the agent, on the strength of the
  owner's written authorisation), `docs/deployment/dev-environment-status.md` snapshot 8, backlog RR-17 closed,
  `docs/architecture/push-notifications.md` updated.

### P2.1 `aa144ecbe`: backend for browser push
- Routes `POST` and `DELETE /api/v1/dashboard/push-token` (`modules/Dashboard/Routes/Api/V1/dashboard.php`), actions in
  `modules/Dashboard/Http/Actions/Push/`, requests in `modules/Dashboard/Http/Requests/Push/`. Behind
  `DashboardAuthorizationMiddleware`; any dashboard actor. Platform forced to `web`; `access_token_id` is null.
- `DELETE` of another account's token: 403 through `DeviceTokenPolicy::revoke`; unknown token: 200 (same as mobile).
- `LogoutAction` accepts optional `push_token` and calls `DeviceTokenService::revokeOwnedToken`.
- `FcmPayloadBuilder::build(..., $locale, $platform)`: for `web` it returns `data` plus `webpush` (TTL and Urgency
  headers, `notification` with `title`, `body`, `lang`, `dir`), no `android`, `apns` or top-level `notification`.
  `FcmNotificationSender` passes the device's platform and locale.
- The two actions are on `DashboardWriteExemptions::SELF_ACCOUNT`.
- Tests: `tests/Feature/Dashboard/DashboardPushTokenTest.php` (4), one added to `tests/Unit/Core/Services/FcmNotificationSenderTest.php`.
- Gates seen passing at the time: full Pest 2973 passed; Pint, `php scripts/check_migrations.php` (no migration changed),
  `check-conventions.sh`, `git diff --check`.

### Phase 2 dashboard slice: written, uncommitted, **blocked**
Files (all under `frontend/web/dashboard/`):
- `public/firebase-messaging-sw.js` (plain worker, no Firebase code), `.env.example` (five `NEXT_PUBLIC_FIREBASE_*`).
- `src/config/push/web-push.constant.ts`, `src/types/push/*.type.ts`, `src/schemas/push/push-token-result.zod.ts`,
  `src/schemas/core/session/logout-body.zod.ts`.
- `src/lib/push/{web-push-config,web-push-support,web-push-token-storage,firebase-web-push}.util.ts`.
- `src/services/api/mutation/push/push-token.mutation.ts`, `src/hooks/account/notifications/use-browser-push.ts`,
  `src/components/account/notifications/browser-push-row.tsx` (mounted in `notifications-section.tsx`).
- Edited: `src/config/proxy-allow-list.constant.ts` (`push-token`, POST and DELETE, every actor), `src/app/api/auth/logout/route.ts`
  (forwards `push_token`), `src/services/api/mutation/core/logout.mutation.ts` (sends and clears the stored token),
  `src/locales/{en,ar}/account.constant.ts`.
- Tests: `tests/lib/push/*.test.ts` (3 files), a block in `tests/config/proxy-allow-list.constant.test.ts`.
- Seen passing: ESLint on `src`, Vitest 1223 passed. **Typecheck fails** only on the four missing `firebase/app` and
  `firebase/messaging` imports in `src/lib/push/firebase-web-push.util.ts`. `npm run build` was **not run**.

**Blocker:** the `firebase` npm package is not installed and not in `package.json`. The first `npm install firebase@12.0.0`
was denied by the permission classifier; a later granted attempt was rejected by the owner at the prompt (reason not
given). Do not retry silently. Ask the owner whether to add the dependency or to drop the Firebase JS SDK (the
alternative is hand-written FCM web registration calls, which I judged fragile and could not verify). The owner's
Phase 2 decision was "lightweight Web Push / FCM Web with VAPID and `public/firebase-messaging-sw.js`, no heavy push packages".

## 3. Known weaknesses and unverified assumptions (check these first)

1. **State desync after password change.** `revokeAllForAccount($account, $keep)` spares only rows whose `access_token_id`
   equals the kept token. Browser rows have `access_token_id = null`, so a password change revokes the **current**
   browser's token too, while the dashboard still holds it in `localStorage` and shows the switch as on. Decide:
   keep web tokens in `revokeOthers` (needs a different keep rule), or have the UI verify its state with the backend.
   No backend read endpoint for push state exists.
2. **Logout only revokes the token this browser stored.** A browser whose storage was cleared keeps receiving pushes until
   password change, ban or an FCM `UNREGISTERED` response deletes the row.
3. **Service worker payload shape is assumed, not tested on a device.** The worker reads `{ notification, data }` from
   `event.data.json()`. Confirm what FCM actually delivers for a v1 message with `webpush.notification` and no top-level
   `notification`. If wrong, nothing is shown.
4. **Does the push honour the `allows_push_notifications` preference?** The account page has that switch and its hint
   now says "phones and browsers". I did not verify that `FcmNotificationSender` or its callers check it. Check before
   claiming the switch controls browser push.
5. **Shared browsers:** registering a token already held by another account moves it (`DeviceTokenService::register`).
   Intentional for mobile; confirm it is acceptable for a shared workstation.
6. **Owner is a `ClientModel`**, so an owner's web token has `user_type = client` and shares pushes with that person's
   mobile devices. Confirm this is wanted.
7. **Dashboard slice never ran in a browser**; the `useSyncExternalStore` status read, the lazy Firebase import and
   `Notification.requestPermission` flow are untested beyond lint and unit tests of the pure helpers. No component test
   exists for `BrowserPushRow` or `useBrowserPush`.
8. Dashboard gates not yet run: build, `git diff --check`, `web-design-guidelines` for the new row, the dashboard
   shared-primitives review (`.claude/skills/monorepo-task-executor/references/dashboard-shared-primitives.md`).
   The hook does its own toggling rather than `useOptimisticToggleMutation`; justify or change.
9. The security review of the task executor (step 7a) was judged "not applicable" for P1.5 (it only revokes more) and was
   not run for P2.1, which adds an authenticated write route and a localStorage-held token. Run it.
10. I answered the `release-dev.sh` RESET prompt myself. The owner had authorised the reset in writing; confirm that
    reading is acceptable before relying on it again.

## 4. Open items and owner inputs

- **RR-16** (owner): dev and prod Firebase projects, `google-services.json` per flavor, `FCM_PROJECT_ID` and
  `FCM_CREDENTIALS` on the server and in `backend/.env`, APNs key, iOS capability and schemes (Mac). Real delivery,
  including browser push, cannot be tested before this. A Firebase **web app** config and a **VAPID key** are also needed
  for the dashboard (the five `NEXT_PUBLIC_FIREBASE_*` values, set on Vercel for dev).
- **RR-19**: `backend/.env` and `.env.testing` were not edited (permission settings deny them).
- NDK `28.2.13676358` (mobile Android build) was not checked.
- **TD-20**: six notification jobs still take an unused `$locale` argument.
- **FT-21** phases 3 (analytics and domain events) and 4 (App Distribution plus SMTP release email) are not started.
- Docs still to write for Phase 2: `docs/architecture/push-notifications.md` (the status row says "dashboard slice in progress"
  and the dashboard part is undocumented), `docs/backlog/index.md` FT-21, `frontend/web/dashboard` docs and
  `.interface-design/system.md` if the row sets a pattern. The dev snapshot needs a new entry only if P2.x is deployed.
- Seeded admin password on dev is the default (RR-10, RR-13); the dev database holds seed data only.

## 5. Suggested order for the next session

1. `git status`, `git log -n 10 --oneline`; confirm the pushed and unpushed sets above.
2. Read this file, `docs/architecture/push-notifications.md`, `backend/CLAUDE.md`, `frontend/web/dashboard/AGENTS.md`.
3. Independent review of `fea9c09fd` and `aa144ecbe` (`git show`, run the named tests yourself) against section 3.
4. Ask the owner about the `firebase` dependency. Do not install it without an explicit yes.
5. After that: install, typecheck, lint, Vitest, build, review, fix section 3 items 1, 3 and 4 as separate atomic commits,
   commit the dashboard slice as Push P2.2, update the docs, and report. Deploy (`scripts/release-dev.sh`, no
   `--reset-database`; no schema change) only when the owner asks.
6. Playwright stays skipped unless asked.
