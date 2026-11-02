---
nodeid: backend.11-backend-architecture.part-5
parentnode: backend.11-backend-architecture.group-1
childnodes: []
codeanchors:
  - backend/modules/
---

Part 5 of 19 · [11 — Backend Architecture (C4 Level 3: Components & Conventions)](11-backend-architecture.md) · [Previous](11-backend-architecture-part-4.md) · [Next](11-backend-architecture-part-6.md)

## 10. Guided tour

```
bootstrap/providers.php                 # Entry: all providers, in explicit order
├── Modules\Auth\...                     # sessions, password reset
├── App\Providers\...                    # rate limiting, model strict mode
├── App\Providers\Filament\...           # Admin + Client panel discovery
└── Modules\{Brand,Branch,Chair,Barber,Affiliation,Service,Booking,Review,Job,Currency,Settings}\...

modules/Booking/                         # one module = one aggregate from 06
├── Providers/BookingServiceProvider.php # loads migrations/lang/views; register() empty; boot() guards with File::exists
├── Models/BookingModel.php              # final Eloquent model
├── Http/
│   ├── Requests/CreateBookingRequest.php   # form-request validation (the input-shaped 04 rules)
│   └── Actions/
│       ├── ListAllBookingsAction.php        # invokable; thin; calls handler
│       └── CreateBookingAction.php
├── Handlers/
│   ├── ListAllBookingsHandler.php           # handle(): logic only
│   └── CreateBookingHandler.php             # enforces E1/E2 via concurrency-safety
├── Repositories/                            # (or Resolvers/) — Eloquent only
│   ├── ListAllBookingsEloquentResolver.php  # one method; newQuery()
│   └── CreateBookingEloquentResolver.php
├── Presenters/BookingPresenter.php          # output formatting
├── Database/
│   ├── Migrations/                          # module-owned tables (see migrations skill for cascades)
│   ├── Seeders/
│   └── Factories/BookingFactory.php
├── Filament/
│   ├── Admin/{Resources,Pages,Widgets}/     # admin UI (reads presenters + resolvers)
│   └── Client/{Resources,Pages,Widgets}/    # client UI
├── lang/{en,ar}/booking.php
└── Resources/views/

config/panels.php                        # panel colors, paths, brand, plugins
```

---

## 11. Why this way

- **Cognitive isolation.** N features, N directories; onboard one module at a time.
- **Small classes by construction.** Action/Handler/Resolver each hold one method — nothing becomes a 2,000‑line service.
- **No framework lock‑in.** Modules are PSR‑4 PHP classes, not Laravel magic; the pattern survives a framework change.
- **Cheap to delete.** A failed feature = delete one directory + one line in `providers.php`.
- **Dual‑panel reuse.** Admin and Client share models, resolvers, and presenters; only the Filament UI differs.
- **Translation as infrastructure.** `ar`/`en` from day one of every module.

---

## 12. How this binds to the rest of the docs & harness

- **Entities (`06`) → modules.** One module per aggregate; `{Entity}Model` per entity.
- **House rules (`04`) → handlers + tests.** Each rule is enforced in the relevant `…Handler` and proven by a test (testing skill).
- **Flows (`07`) → actions.** Each step that hits the backend is one Action.
- **Containers (`10`) → this is its inside.** `10` named the API container; this is its component structure.
- **The skill** `.claude/skills/laravel-baseline/module-architecture/SKILL.md` makes all of the above enforceable in the Ralph loop, and can carry the concrete code patterns on request.

---
