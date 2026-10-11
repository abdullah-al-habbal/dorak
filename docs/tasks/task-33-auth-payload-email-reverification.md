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

## Acceptance Criteria
- [ ] `POST client/login`, `POST client/register`, `POST client/social/{provider}` and `GET client/profile` all return the same 8-key client object (asserted with `assertJsonStructure`).
- [ ] `PATCH client/profile` with a new email returns 200 and the DB row has `email_verified_at = NULL`; a verification mail is queued (`Mail::fake()` assertion).
- [ ] `PATCH client/profile` with the same email leaves `email_verified_at` unchanged.
- [ ] Mobile DTO unit test parses all 8 fields.
- [ ] `php artisan test` and `melos run test` pass; PHPStan max + Pint clean for touched backend files.

## Out of Scope
- Phone verification — Task 34.
- Client `status` checks at login — Task 09.
