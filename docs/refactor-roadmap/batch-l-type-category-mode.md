# Batch L: Types, categories and modes

Status: Done. Schema edited in place in the create-migrations; every consumer changed in the same commit.

| Table | Old | New | Wire key |
| --- | --- | --- | --- |
| `job_postings` | `type` | `employment_type` | `employment_type` |
| `sections` | `type` | `section_type` | `section_type` (marketing page API) |
| `service_catalog_media` | `type` | `media_type` | `media_type` |
| `device_tokens` | `platform` | `platform_type` | `platform_type` (request) |
| `payouts` | `direction` | `direction_type` | `direction_type` |
| `languages` | `direction` | `text_direction` | n/a (Filament only) |
| `service_catalog_items` | `formality`, `style_period` | `formality_level`, `style_period_type` | same |
| `preferences` | `theme` | `theme_mode` | `theme_mode` |
| `service_catalog_item_tags` | `group` | `group_name` | `group_name` |
| `dashboard_refresh_tokens` | `guard` | `guard_name` | n/a |

Enum classes keep their names (`JobPostingTypeEnum`, `MediaTypeEnum`, `DevicePlatformEnum`, `PayoutDirection`, `TextDirectionEnum`, `ThemeEnum`); only casts and `Rule::enum` keys changed.

## Deliberately not changed
- `features.scope` / `features.value`: this is the Laravel Pennant table and its database driver hard-codes `name`, `scope`, `value`. Renaming would break feature flags.
- `commission_rules.type` / `scope` (not in the batch scope), `notifications.type` (framework table) and platform-setting `group` (a setting-group enum, not a tag group).
- Payload keys `type` inside notification data, explore search items and floor-plan decorations.
