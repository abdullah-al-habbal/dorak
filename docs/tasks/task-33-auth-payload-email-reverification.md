# Task 33: Complete Auth Payload and Email Re-verification

**Phase:** Auth & Account · **Priority:** P1 · **Depends on:** Task 32 · **Audit source:** Feature-spec audit — BE-02 / BE-19 (`backend/docs/features/BE-02-client-auth.md`, `backend/docs/features/BE-19-profile-expand.md`)

## Overview & Root Cause
Login, register and social login return a hand-built client array with only `id`, `name`, `email` and `phone`, so the apps cannot read `preferred_universe`, `avatar`, `email_verified_at` or `created_at` without a second call. Separately, changing the email through `PATCH client/profile` does not reset `email_verified_at`, so a client can switch to an unverified address and keep the verified flag.

## Evidence
- `backend/modules/Client/Handlers/Client/LoginHandler.php:28-34` — success payload limited to id/name/email/phone.
- `backend/modules/Client/Handlers/Client/RegisterHandler.php:36`, `backend/modules/Client/Handlers/Client/SocialLoginHandler.php:55` — same reduced shape ending at `phone`.
- `backend/modules/Client/Eloquent/Resolvers/Client/UpdateProfileEloquentResolver.php:19` — writes `email` with no change to `email_verified_at`.

## Full-Stack Scope
### Backend (API / DB / Policies)
- Introduce one client API resource used by login, register, social login, `GET client/profile` (Task 32) and `PATCH client/profile`, with: `id, name, email, phone, avatar, preferred_universe, email_verified_at, created_at`.
- In `UpdateProfileEloquentResolver`, when the email value changes, set `email_verified_at = null` and send a new verification email.
### Dashboard (BFF / React)
- None — client auth only.
### Mobile (Flutter / Repositories)
- Extend `packages/core/lib/src/network/dto/client.dto.dart` (and regenerate `client.dto.g.dart`) with `avatar`, `preferredUniverse`, `emailVerifiedAt`, `createdAt`.
- Profile edit (`apps/client_app/lib/src/features/profile/profile_edit.bloc.dart`) must route the user to email verification when the response shows `email_verified_at == null` after an email change.

### Implemented contract
- Shared code path: `ClientProfileResource::make($client)->resolve()`, used by `LoginHandler`, `RegisterHandler`, `SocialLoginHandler` (register/social refresh the model so DB defaults such as `preferred_universe` are present), `GetProfileAction` and `UpdateProfileAction`. `ClientModel::authPayload()` (Task 32) is removed.
- Scope of the rule: any email that differs case-insensitively from the stored one resets verification; the same email, or a request without an email, leaves `email_verified_at` untouched.
- Request: unchanged (`PATCH client/profile` `email` still `unique` ignoring self).
- Failure: unchanged; a mail dispatch failure is reported but does not fail the update.
- Success: HTTP 200, `data` = 8 keys; on email change `email_verified_at = null`, a new code is cached for 10 minutes and mailed to the new address; the client may then only call the verification routes until `POST client/email/verify` succeeds.
- Dashboard: none (client auth only; lint/typecheck/Vitest/build re-run green). Mobile: `core` `ClientDto` (+`avatar`, `emailVerifiedAt`, `createdAt`; `emailVerified` is now a getter), `client_app` `ProfileEditCubit`/`ProfileEditScreen` (email field, error text, `profileEmailLabel` EN+AR), router (session refresh via `SessionAuthenticated`, push `authVerify` after an email change). `business_app`/`stylist_app` use staff auth with their own DTOs and need no change. Docs: decisions-required, backend feature-index.
- Deviations from the original spec text: `email_verified` (Task 32) is dropped in favour of the 8-key object. Known gap, pre-existing from Task 09: `POST client/refresh-token` sits behind the active-account middleware, so an unverified client (new registrant or email changer) who restarts or resumes the app during verification is treated as 403 and signed out.

## Acceptance Criteria
- [x] `POST client/login`, `POST client/register`, `POST client/social/{provider}` and `GET client/profile` all return the same 8-key client object (asserted with `assertJsonStructure`).
- [x] `PATCH client/profile` with a new email returns 200 and the DB row has `email_verified_at = NULL`; a verification mail is queued (`Mail::fake()` assertion).
- [x] `PATCH client/profile` with the same email leaves `email_verified_at` unchanged.
- [x] Mobile DTO unit test parses all 8 fields.
- [x] `php artisan test` and `melos run test` pass; Pint clean for touched backend files (PHPStan intentionally skipped per the user's instruction for this task).

## Out of Scope
- Phone verification — Task 34.
- Client `status` checks at login — Task 09.
