---
nodeid: backend.readme.part-2
parentnode: backend.readme
childnodes: []
codeanchors:
  - backend/modules/
---

Part 2 of 3 · [Dorak Backend (دورك)](README.md) · [Previous](README.md) · [Next](readme-part-3.md)

### 4. Development

```bash
composer dev      # Starts server, queue, logs, Vite concurrently
composer test     # Runs PHPUnit/Pest tests
```

## Project Architecture

Dorak Backend follows a **modular monolith** approach. All code lives under `modules/`.  
The `Core` module provides the foundation: configuration, translations, base HTTP classes, CQRS primitives, and the user identity system. Future domain modules (Booking, Barber, Salon, etc.) depend one‑way on `Core`.

```
modules/
└── Core/
    ├── Config/                  # All Laravel config files (loaded manually)
    ├── Console/Commands/
    ├── CQRS/                    # Command & Query payloads
    ├── Database/
    │   ├── Factories/
    │   ├── Migrations/
    │   └── Seeders/
    ├── Eloquent/Resolvers/      # Data access layer (single responsibility)
    ├── Enums/
    ├── Handlers/                # Business logic (one handle() method)
    ├── Helpers/                 # ApiResponseTrait
    ├── Http/
    │   ├── Actions/             # Invocable API actions
    │   ├── Middleware/
    │   └── Requests/            # Form requests → Command/Query
    ├── Models/
    ├── Providers/
    ├── Routes/
    ├── Services/
    ├── ValuesObjects/
    └── lang/                    # ar/ & en/ translation files
```

**Key invariants:**

- **No `app/` or `config/` directories** – everything has been moved into modules.
- **`env()` only in config files** – nowhere else.
- **CQRS everywhere** – Requests build Command/Query objects, Actions dispatch to Handlers, Handlers use Resolvers.
- **Suffix conventions** – `Model`, `Enum`, `Action`, `Handler`, `Resolver`, `Command`, `Query`, `Request`, `Middleware`, `Service`, `Presenter`, etc.
- **All classes `final`** unless intentionally extensible.
- **`declare(strict_types=1)`** on every file.
- **Translations** under `lang/` with `core::messages.*` keys.
