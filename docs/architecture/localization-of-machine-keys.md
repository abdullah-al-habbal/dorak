---
nodeid: docs.localization-of-machine-keys
parentnode: docs.architecture
childnodes: []
codeanchors:
  - backend/modules/Core/Enums/PlatformEventEnum.php
  - backend/modules/Core/Services/NotificationRecipientLocale.php
  - backend/tests/Unit/Core/EnumLabelsTest.php
  - frontend/web/dashboard/src/lib/core/format/enum-label.util.ts
  - frontend/web/dashboard/src/locales/
---

# Localizing machine keys (LOC-1 to LOC-5)

Routes: [documentation graph](../index.md) · [architecture](architecture.md) · [testing strategy](testing-strategy.md) · [backlog](../backlog/index.md).

A machine key is a value the API, a permission check or a state machine depends on: `platform_admin`, `in_progress`, `brand_submitted`, `pay_at_salon`. It is a contract. It never changes to suit a language and is never shown to a person as it is.

## The rule

1. **The key is the contract.** API resources return the key (`status`, `role`, `actor_type`). Do not rename or translate it, and do not add a label field to a resource without a concrete consumer.
2. **The label lives with the code that shows it.**
   - Server-rendered text (notifications, mail, exports) uses the backend enum label.
   - The dashboard uses its typed dictionaries in `src/locales/{en,ar}/`.
   - The mobile apps use their ARB files.
3. **A missing label is visible, never silent.** The dashboard shows the localized "Unknown" text (`common.unknown`) instead of the raw key and warns once per `scope:key` outside production. Do not write `labels[key] ?? key`.
4. **Admin-controlled data is data, not an enum.** Languages, currencies, payment gateways, plans and catalog categories carry their own bilingual names in the database. Statuses and roles drive logic, so they stay enums.

## Backend

- Every backed enum with a `label()` returns `__('<module>::enums.<group>.'.$this->value)`. The module name is the lowercase module directory (`jobposting`, `barberaffiliation`). The group is the snake-case enum name (`booking_status`); `BrandStatusEnum` and `BranchStatusEnum` keep their older group `status`.
- Translations are in `modules/<Module>/Lang/{en,ar}/enums.php`.
- `tests/Unit/Core/EnumLabelsTest.php` scans `modules/*/Enums` and fails for any enum with a `label()` whose case has an empty label, the raw value, a missing translation key, or the same text in both languages. A new enum case with no translation fails the suite.
- **Validation messages.** Form errors are translated: `backend/lang/ar/validation.php` (every built-in rule, same keys as the framework's English file) and the field names in `modules/Core/Lang/{en,ar}/validation.php`. The error keys (`name.en`) are contracts and stay as they are. `ApplyPreferredLocaleMiddleware` runs on every dashboard route group, so the dashboard's `Accept-Language` decides the language. `tests/Feature/Core/ValidationAttributeNamesTest.php` checks key parity with the framework file.
- **Notifications.** `PlatformEventEnum::title()` and `body()` read `Core/Lang/{en,ar}/platform_events.php`. `PlatformNotifier` writes each row in the recipient's `preferences.preferred_language` (`NotificationRecipientLocale`), and uses `LocaleConstants::CORE_DEFAULT_LOCALE` (`en`) when the account has no supported preference. The request that raised the event belongs to another actor, so its locale is not used. `data.event` and `data.subject_id` are unchanged. Rows written before LOC-4 keep their English text.

## Dashboard

- `enumLabel(labels, key, unknownLabel, scope)` and `warnUnknownKey()` are in `src/lib/core/format/enum-label.util.ts`.
- The overview panel maps `profile.role` through `shell.overview.roles` and shows no token abilities. `permissions` in `/dashboard/me` is the token's abilities (`dashboard`, `branch-app`, ...), not a user-facing permission list.
- An unknown platform setting key shows `settings.unknownSetting` with the key as a `dir="ltr" translate="no"` hint. An unlabeled brand feature key shows "Unknown" with the key beside it in the plan form.
- **Catalog tag groups (TD-18).** `service_catalog_item_tags.group_name` is a translatable JSON column (`{en, ar}`, both required when a group is set). The mobile-facing `tags[].group_name` stays one string, resolved in the request language. The dashboard resources add `group_name_translations` (`{en, ar}` or `null`) for the form, and the tag dialog has one field per language. The tag list shows that string, or "No group" when empty.

## Adding a new key

| You add | Also add |
|---|---|
| An enum case | The EN and AR strings in the module's `Lang/*/enums.php`, a dashboard enum case and dictionary entry where the dashboard renders it, and an ARB key where a mobile app renders it. |
| A platform event | Its `platform_events.php` entries (EN and AR) and `NotificationEvent` plus the dashboard text. |
| A platform setting | Its `settings.keys` label in both dashboard languages. |

## Mobile

No mobile file changed. Mobile shows the stored notification `title` and `body` as they are, so new notifications now arrive in the recipient's language. Open mobile items stay in the backlog as TD-2 (string literals) and TD-3 (unknown `BookingStatus`).
