# Task 36: Enforce Account Deletion Rules and History Anonymization

**Phase:** Auth & Account · **Priority:** P1 · **Depends on:** Task 18 · **Audit source:** Feature-spec audit — BE-19 (delete account); product-spec audit — HIST-2 (`backend/docs/04_house-rules.md:141`)

## Overview & Root Cause
`DELETE client/account` only blocks deletion when the client has a `confirmed` booking; `pending` and `in_progress` bookings do not block it, so a client can disappear mid-service. The house rules also require service history to be anonymized on account deletion, but clients are soft-deleted while `client_service_histories.client_id` is a NOT NULL foreign key with `cascadeOnDelete`, so history is neither anonymized nor retained in an anonymous form.

## Evidence
- `backend/modules/Client/Repositories/DeleteAccountEloquentResolver.php:16` — `whereIn('status', [BookingStatus::Confirmed])`.
- `backend/modules/Client/Models/ClientModel.php:40` — `use SoftDeletes`.
- `backend/modules/ClientHistory/Database/Migrations/2026_07_19_000001_create_client_service_histories_table.php:15` — `foreignUuid('client_id')->constrained('clients')->cascadeOnDelete()`.

## Full-Stack Scope
### Backend (API / DB / Policies)
- Block deletion when any booking is `pending`, `confirmed` or `in_progress` (use the active-status set defined in Task 18); return 409 with a stable error code.
- On deletion: revoke all tokens, scrub PII on the client row (name, email, phone, avatar), and anonymize history (make `client_id` nullable with `nullOnDelete`, or detach and keep an anonymous marker).
  - **Decision (resolved, best option): soft delete + PII scrub.** A hard delete cascades through `bookings.client_id` (`cascadeOnDelete`) and would erase branch/barber booking records, and FACE-3 needs the row to exist during the 30-day photo grace period. HIST-2 prescribes `client_id = null` on history, which the soft-deleted row does not trigger by FK, so a synchronous observer does it explicitly.
### Implemented contract
- Shared code path: `Modules\Client\Services\ClientAccountDeletion::delete()`, used by `DeleteAccountHandler` (`DELETE client/account`) and the admin Filament `ClientsTable` `DeleteAction` (`->using()`). HIST-2 anonymization: `Modules\ClientHistory\Observers\ClientDeletedObserver::deleted()`, registered on `ClientModel`, runs inside the deletion transaction.
- Scope of the rule: deletion is blocked while any booking is in `BookingStatus::reservationBlockingValues()` (`pending`, `confirmed`, `in_progress`); `completed`, `canceled`, `no_show` do not block. The check and the writes run in one transaction with the client row locked.
- Request: unchanged (`password`, required).
- Failure: HTTP 409, `code = ACCOUNT_HAS_ACTIVE_BOOKINGS` (`DeleteAccountResult::ACTIVE_BOOKINGS_CODE`), `message = core::messages.active_bookings_block_deletion`; nothing changes. Wrong password stays 401. Admin panel: the action fails with the `client::ui.delete_blocked_active_bookings` notification.
- Success: HTTP 200 (unchanged envelope). Tokens and social accounts deleted; client row scrubbed (name `client::messages.deleted_client_name` in en/ar, email `deleted-{id}@deleted.invalid`, phone, `phone_verified_at`, `email_verified_at`, avatar → null, random password, status `disabled`) then soft-deleted; the avatar file is deleted from the public disk after commit. History rows keep barber/branch/service/catalog/rating/metadata/date; `client_id`, `booking_id`, `client_notes`, `barber_notes` → null and their media rows are deleted.
- Dashboard: none. Mobile: no UI change (Task 80 wires the screen); `packages/core` test asserts the 409 surfaces as `ApiException(statusCode: 409, code: 'ACCOUNT_HAS_ACTIVE_BOOKINGS')`. Docs: this spec, `docs/decisions-required.md`, `backend/docs/feature-index.md`, `backend/docs/features/BE-19-profile-expand.md`.
- Deviations from the original spec text: the blocked response changed from 422 `UNPROCESSABLE_ENTITY` to the 409 the spec requires. `booking_id` and both note fields are also cleared on history (free text and the booking link can re-identify the person). Fixed in passing: the admin Clients list crashed rendering the status badge (`ClientStatusEnum` passed to a `string` closure), which made the panel delete action unreachable.

### Dashboard (BFF / React)
- None.
### Mobile (Flutter / Repositories)
- Handled by Task 80 (wiring delete-account UI to `auth.repository.dart` `deleteAccount`); the UI must show the 409 "active bookings" message.

## Acceptance Criteria
- [x] Client with a `pending`, `confirmed` or `in_progress` booking → `DELETE client/account` returns 409; account unchanged. One Feature test per status.
- [x] Client with only `completed`/`canceled`/`no_show` bookings → 200; all tokens deleted; PII columns scrubbed.
- [x] After deletion, the client's `client_service_histories` rows contain no client-identifying data (asserted in test).
- [x] `php artisan test` passes; Pint clean (PHPStan skipped for this run on the user's instruction).

## Out of Scope
- Mobile delete-account screen — Task 80.
- Barber reading client history — Task 58.
