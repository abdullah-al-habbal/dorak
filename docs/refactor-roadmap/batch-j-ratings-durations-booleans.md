# Batch J (part 2): Ratings, durations and state booleans

Status: [x] Done. Schema edited in place; backend, dashboard and mobile synchronized.

## Renames
- `barbers.rating_avg` / `branches.rating_avg` to `rating_average`.
- `offered_services.duration` to `duration_minutes` (wire key too). The floor-plan query parameter `duration` is now `duration_minutes`.
- `preferences.is_notification_enabled` to `allows_notifications`; `preferences.is_dual_price_display_enabled` to `allows_dual_price_display` (wire: `allows_dual_price_display`).
- `dashboard_notification_preferences`: `email_enabled`, `push_enabled`, `booking_enabled`, `system_enabled` to `allows_email_notifications`, `allows_push_notifications`, `allows_booking_notifications`, `allows_system_notifications`.
- `client_discovery_preferences.show_unavailable` to `allows_unavailable_results`.
- `client_favorites.favorable_id` / `favorable_type` (morph `favorable`) to `favorited_id` / `favorited_type` (morph `favorited`); `FavorableTypeEnum` is now `FavoritedTypeEnum`, `FavorableExists` is `FavoritedExists`, lang key `favorited_not_found`. Wire keys and the favorites response relation are renamed too.

## Notes
- Wire-key renames are breaking for deployed clients (repo is pre-release).
- `backend/phpstan-baseline.neon` favorite entries were updated textually; other stale baseline entries from earlier batches are untouched.

## Verification
`migrate:fresh --seed`, Pint, backend 1331 tests; dashboard lint, 509 tests, build; mobile `melos verify`.
