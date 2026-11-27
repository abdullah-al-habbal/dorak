---
codeanchors:
  - frontend/mobile/apps/client_app/lib/
---

Part 2 of 3 · [Backend-Driven Default Page Size (pagination.per_page)](per-page.md) · [Previous](per-page.md) · [Next](per-page-part-3.md)

### Seeder

`modules/ApplicationSetting/Database/Seeders/ApplicationSettingSeeder.php`

Seeds the default page size so the endpoint always has a value:

```php
['key' => 'pagination.per_page', 'value' => 15, 'group' => 'pagination', 'is_public' => true, 'is_active' => true]
```

### Endpoint

`GET /api/v1/app/settings` — public, same style as
`Modules\Onboarding\Routes\Api\V1\onboarding-config.php`.

Behavior:

* Optional `?keys[]=pagination.per_page` filter — client requests only the
  keys it needs. No filter → return all `is_public` && `is_active` keys.
* Response envelope: `{success, data: {settings: [{key, value}]}}`.
* Unknown/inactive keys are silently omitted (never 404 the whole call).
* `per_page` must be an integer ≥ 1; the server clamps invalid stored values.

Caching: file/database cache per key with a short TTL (e.g. 5 min); the
settings endpoint is hot on app cold-start.
