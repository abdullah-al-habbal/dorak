---
name: laravel-attributes
description: MANDATORY reference for all new Laravel 13 PHP code in this repo. Use class attributes (#[Fillable], #[Table], #[Signature], etc.) instead of class properties for Eloquent models, jobs, console commands, controllers, form requests, resources, factories, testing hooks, and container injection. READ BEFORE WRITING any new PHP code. Source: laraveldaily.com "PHP Attributes in Laravel 13: The Ultimate Guide (36 New Attributes)".
---

# Laravel 13 PHP Attributes — Ultimate Reference

Attributes are **optional** and NOT breaking changes — old property syntax still works. This repo's convention: **attributes only**. New code MUST use attributes, not class properties.

Repo state (Laravel 13.20.0, PHP 8.5):
- Already migrated: `#[Fillable]`, `#[Hidden]`, `#[Table]` on all models; `#[Translatable]` (spatie) on bilingual models; `#[Signature]`/`#[Description]` on commands.
- N/A here: controllers are banned (invokable Actions only), so `#[Middleware]`/`#[Authorize]` don't apply.

Verify attribute signatures against `vendor/laravel/framework/src/Illuminate/**/Attributes/*.php` and `vendor/spatie/laravel-translatable/src/Attributes/*.php` before relying on them.

**Related:** this skill answers *how a Laravel class is configured*. Before writing the code
inside it — queries, caching, queue dispatching, validation, HTTP integrations, authorization,
file handling, persistence — read
[../laravel-native-abstractions/SKILL.md](../laravel-native-abstractions/SKILL.md), which
answers *what Laravel already knows how to do for you*. The two are complementary: container
and queue attribute signatures live here; the decision of whether to reach for a framework API
at all lives there.

---

## Reference tables

| Category | Read |
| --- | --- |
| Eloquent model attributes (`#[Fillable]`, `#[Table]`, ...) | [`references/eloquent-attributes.md`](references/eloquent-attributes.md) |
| Queue/job and console command attributes | [`references/queue-and-console-attributes.md`](references/queue-and-console-attributes.md) |
| Routing, form request, HTTP resource, factory, testing attributes | [`references/routing-form-resource-factory-testing.md`](references/routing-form-resource-factory-testing.md) |
| Pre-existing Laravel 11-12 attributes (observers, scopes, DI, container) | [`references/pre-existing-attributes.md`](references/pre-existing-attributes.md) |

## Rules for this repo

1. New model/job/command/request/resource/factory/test code MUST use attributes — no `$fillable`, `$table`, `$signature`, `$tries`, etc. properties.
2. Spatie translatable: `#[Translatable(['name'])]` from `Spatie\Translatable\Attributes\Translatable` (with `HasTranslations` trait), not `public array $translatable`.
3. One attribute per line, directly above the class declaration.
4. Import attribute classes in alphabetical order (pint `ordered_imports` fixes it).
5. After writing attributes, run `vendor/bin/pint` on touched files — it normalizes array indentation and import order.
6. `#[ObservedBy]` NOT used in this repo — observers are registered per-module in service providers to keep module isolation.
7. Controllers banned — no `#[Middleware]`/`#[Authorize]`.
