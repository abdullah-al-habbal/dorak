---
name: coding-standards
description: "Mandatory PHP coding conventions for this project: strict_types, final classes, PHP 8 attributes, naming suffixes, env() rules. Use whenever writing or reviewing any PHP file — these override generic Laravel defaults."
codeanchors:
  - backend/modules/
---

# Coding standards

## Mandatory

- `declare(strict_types=1)` as the first statement after `<?php` in every file.
- `final` for all service providers and middleware. `abstract` for base classes.
- No PHPDoc comments — clean stubs only.
- No magic strings for statuses, codes, or errors — use enums (`ErrorCodeEnum`, `SuccessCodeEnum`).
- No default values in `env()` calls — all env vars defined in `.env.example`.

### `env()` is Forbidden Outside Config Files

- `env()` is only allowed inside files under `modules/*/Config/`.
- No other class, action, handler, or resolver may call `env()`.
- Always retrieve configuration with `config('key')`.
- This rule is enforced by code review.

## PHP 8 attributes

Use PHP 8 attributes for Eloquent model metadata instead of `$fillable`/`$hidden`/`$table`/`$translatable` properties:

```php
#[Fillable(['name', 'email', 'password'])]
#[Hidden(['password', 'remember_token'])]
#[Table('clients')]
#[Translatable(['name'])]
class ClientModel extends Authenticatable
```

- `#[Table('table_name')]` replaces `protected $table`. Only pass extra args (`key`, `keyType`, `timestamps`, `dateFormat`) when the property previously set them.
- `#[Translatable([...])]` (spatie) replaces `public array $translatable`. Import from `Spatie\Translatable\Attributes\Translatable` alongside `HasTranslations`.
- Same value, same behaviour — attributes resolve lazily through `Model::resolveClassAttribute()` in the constructor, so runtime is identical.

## Continued in

- [Part 2: Naming](references/skill-part-2.md)
