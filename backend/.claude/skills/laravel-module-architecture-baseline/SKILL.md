---
name: laravel-module-architecture-baseline
description: The mandatory backend architecture standard for this salon/barbershop platform. Use this whenever creating or editing ANY backend class - a new module, an action, a handler, an Eloquent resolver, a presenter, a form request, a model, a service provider - and whenever deciding WHERE a piece of code should live. Enforces the modular-by-domain layout under modules/{Name}/ and the strict Action -> Handler -> EloquentResolver flow (no controllers, no service layer, no repositories; each layer is a single-method final class named by action). Always consult this skill before writing backend code; it overrides default Laravel conventions. Mirrors docs/11.
nodeid: skills.backend.laravel-module-architecture-baseline
parentnode: skills.backend
childnodes:
  - skills.backend.laravel-module-architecture-baseline.part-2
codeanchors:
  - backend/modules/
---

# Module Architecture — baseline standard

The non‑optional shape of the backend. It overrides default Laravel habits (no `BookingController@index`, no `BookingService`, no `BookingRepository`). How the backend is laid out today: `docs/11-backend-architecture.md`. Where the code differs from these rules, see backlog BD-16. This skill is **conventions + a checklist**, not code.

## The hard rules

1. **Everything lives in a module.** New backend code goes under `modules/{Name}/`, never in `app/` (the backend has none). One module per aggregate from `docs/06` (`Brand`, `Branch`, `Chair`, `Barber`, `Affiliation`, `Service`, `Booking`, `Review`, `Job`, `Currency`, `Settings`, `Auth`, …).
2. **No Controller, no Service, no Repository — ever.** Use the triad instead:
   - **Action** — invokable (`__invoke`), in `Http/Actions/`, named `{Verb}{Subject}Action` (e.g. `ListAllBookingsAction`). Thin: take the validated request, call the handler, return via presenter/resource. **No business logic, no Eloquent.**
   - **Handler** — in `Handlers/`, named `{Verb}{Subject}Handler`, **exactly one method `handle()`**. All logic for that one action; enforces the relevant `docs/04` rules; calls the resolver for data.
   - **EloquentResolver** — in `Repositories/` (or `Resolvers/` — match the project's chosen folder), named `{Verb}{Subject}EloquentResolver`, **exactly one method**, containing **only** the Eloquent operation. The **only** place Eloquent runs.
3. **One action = one HTTP responsibility = one method per layer.** If a class would gain a second public method, that's a new action (new triad). Nothing accumulates methods.
4. **`final` on every class.** No inheritance. Share via a **trait** or by **calling a collaborator**, never a base class.
5. **No interfaces, no abstract bases.** Concrete classes only; the contract is the method signature.
6. **`newQuery()`, never `Model::query()`.** Resolvers inject the model in the constructor and call `$this->model->newQuery()`.

## Provider & boot rules

- Register every module provider **by name** in `bootstrap/providers.php` (no auto‑discovery).
- **`register()` is empty.** No bindings, no deferred providers.
- In `boot()`, guard each `load*` call with `File::exists()` / `File::isDirectory()` — a missing directory is not an error.

## Translation‑first (enforces docs/04 J1/J2)

- Every module ships **both** `lang/en/` and `lang/ar/`.
- **No hardcoded UI strings** — always translation keys (`__('booking::labels.time_slot')`).
- Translatable model attributes use `SpatieTranslatable`.

## Where each file goes (quick map)

```
modules/{Name}/
├── Providers/{Name}ServiceProvider.php
├── Models/{Entity}Model.php            (final)
├── Http/Requests/{Action}Request.php   (final)
├── Http/Actions/{Action}Action.php     (final, __invoke)
├── Handlers/{Action}Handler.php        (final, handle())
├── Repositories/{Action}EloquentResolver.php  (final, one method, newQuery())
├── Presenters/{Name}Presenter.php      (final)
├── Database/{Migrations,Seeders,Factories}/
├── lang/{en,ar}/{name}.php
└── Resources/views/
```

## Continued in

- [Part 2: Per‑task checklist](references/skill-part-2.md)
