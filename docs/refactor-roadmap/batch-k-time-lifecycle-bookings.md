# Batch K: Time, lifecycle, bookings

Status: Done

## Renames (create-migrations edited in place, synced across backend, dashboard, mobile)

| Old | New |
| --- | --- |
| `bookings.status` | `bookings.booking_status` (wire key `booking_status`; list filter and PATCH body too) |
| `bookings.time_slot` | `bookings.starts_at` |
| `canceled` / `Canceled` / `canceled_at` | `cancelled` / `Cancelled` / `cancelled_at` (serialized enum values too: booking, subscription, payout) |
| `branch_opening_hours.weekday`, `opens_at`, `closes_at` | `day_of_week`, `opens_time`, `closes_time` |
| `branch_hours_overrides.date` | `override_date` |
| `bans.banned_from` / `banned_until` | `banned_at` / `expires_at` |
| `bans.admin_id`, `activation_logs.admin_id` | `banned_by_id`, `activated_by_id` |
| `testimonials.display_order` | `sort_order` |
| `reviews.resolved_by` | `resolved_by_id` |
| `dashboard_refresh_tokens.replaced_by_id` | `replaced_by_token_id` |
| `client_service_history_media.history_id` | `client_service_history_id` |

## Intentionally unchanged

- Push-notification payload key `status`; client `ListUserBookingsRequest` `status` filter (upcoming/past).
- Computed `date` key in `BranchHours::forDate()` and the `date` request/route param.
- ARB key `bookingStatusCanceled` (localization package).

## Checks

Backend `migrate:fresh --seed`, Pint, 1331 Pest tests; dashboard lint, 510 tests, build; mobile `melos run verify`.
