---
nodeid: backend.11-backend-architecture.part-3
parentnode: backend.11-backend-architecture.group-1
childnodes: []
codeanchors:
  - backend/modules/
---

Part 3 of 19 · [11 — Backend Architecture (C4 Level 3: Components & Conventions)](11-backend-architecture.md) · [Previous](11-backend-architecture-part-2.md) · [Next](11-backend-architecture-part-4.md)

## 4. Design tenets

### Explicit over magic
- **All module providers listed by name** in `bootstrap/providers.php`. No auto‑discovery.
- **`register()` is always empty.** No bindings, no deferred providers — DI resolves by class name at runtime (concrete classes, see below).
- Every `boot()` guards each `load*` call with `File::exists()` / `File::isDirectory()`. **A missing directory is not an error.**

### `final` everywhere
Every module class — provider, model, resolver, presenter, action, handler, form request — is **`final`**. **No inheritance anywhere.** Share via a **trait** or by **calling a collaborator**, never via a base class.

### No interfaces, no abstract bases
Resolvers, handlers, presenters are **concrete** classes with no `implements` and no shared base. The contract is the **method signature**, not an interface — so you cmd+click straight to the implementation. (Indirection stays low; this is deliberate.)

### `newQuery()` not `Model::query()`
Resolvers always use `$this->model->newQuery()`, never the static facade — so a resolver is testable by constructor‑injecting the model.

---

## 5. Web surface

There are no server-rendered admin panels. The Next.js dashboard (`frontend/web/dashboard`) is the only web surface for every guard; it talks to the `/api/v1/dashboard/*` routes through its proxy. The retired Filament panels (decision D1, NS-28) left no routes under `/admin`, `/branch` or `/barber`.

---

## 6. Naming conventions

| What | Convention | Example |
|---|---|---|
| Models | `{Entity}Model` | `BookingModel`, `BranchModel` |
| Tables | explicit `$table`, snake_case plural | `$table = 'bookings'` |
| Actions | `{Verb}{Subject}Action` (invokable) | `ListAllBookingsAction`, `CreateBookingAction` |
| Handlers | `{Verb}{Subject}Handler` (one method `handle`) | `CreateBookingHandler` |
| Eloquent resolvers | `{Verb}{Subject}EloquentResolver` (one method) | `CreateBookingEloquentResolver` |
| Presenters | `{Module}Presenter` | `BookingPresenter` |
| Service providers | `{Module}ServiceProvider` | `BookingServiceProvider` |
| Translation namespace | snake_case module name | `__('booking::messages.key')` |
| Migrations | `YYYY_MM_DD_000{N}_create_{table}_table.php` | stamped for ordering |

---
