---
codeanchors:
  - backend/modules/
---

Part 2 of 2 · [How to add a new module](../SKILL.md) · [Previous](../SKILL.md)

## 2. Create service provider

```php
<?php
declare(strict_types=1);

namespace Modules\{ModuleName}\Providers;

use Illuminate\Support\ServiceProvider;

final class {ModuleName}ServiceProvider extends ServiceProvider
{
    public function boot(): void
    {
        $this->loadMigrationsFrom(__DIR__ . '/../Database/Migrations');
        $this->loadTranslationsFrom(__DIR__ . '/../lang', '{module-slug}');
    }
}
```

## 3. Register in bootstrap/providers.php

```php
return [
    Modules\Core\Providers\ApplicationServiceProvider::class,
    Modules\{ModuleName}\Providers\{ModuleName}ServiceProvider::class,
];
```

## 4. Load routes

In the provider's `boot()` method, include:

```php
$this->loadRoutesFrom(__DIR__ . '/../Routes/Api/routes.php');
$this->loadRoutesFrom(__DIR__ . '/../Routes/Web/web.php');
```

## Example: Booking module

Minimal Booking module would have `Config/`, `Database/Migrations/`, `Http/Actions/`, `Models/`, `Providers/`, `Routes/Api/`, `Services/`, and `CQRS/Command/`, `CQRS/Query/`, `Handlers/`, `Eloquent/Resolvers/` for CQRS flows.
