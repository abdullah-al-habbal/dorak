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
- Decision required: keep soft delete + PII scrub, or hard delete with history `client_id` set to NULL.
### Dashboard (BFF / React)
- None.
### Mobile (Flutter / Repositories)
- Handled by Task 80 (wiring delete-account UI to `auth.repository.dart` `deleteAccount`); the UI must show the 409 "active bookings" message.

## Acceptance Criteria
- [ ] Client with a `pending`, `confirmed` or `in_progress` booking → `DELETE client/account` returns 409; account unchanged. One Feature test per status.
- [ ] Client with only `completed`/`canceled`/`no_show` bookings → 200; all tokens deleted; PII columns scrubbed.
- [ ] After deletion, the client's `client_service_histories` rows contain no client-identifying data (asserted in test).
- [ ] `php artisan test` passes; PHPStan max + Pint clean.

## Out of Scope
- Mobile delete-account screen — Task 80.
- Barber reading client history — Task 58.
