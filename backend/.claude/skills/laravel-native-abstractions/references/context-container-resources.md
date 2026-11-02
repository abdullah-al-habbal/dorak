---
nodeid: skills.backend.laravel-native-abstractions.references.context-container-resources
parentnode: skills.backend.laravel-native-abstractions
childnodes:
  - skills.backend.laravel-native-abstractions.references.context-container-resources.part-2
  - skills.backend.laravel-native-abstractions.references.context-container-resources.part-3
  - skills.backend.laravel-native-abstractions.references.context-container-resources.part-4
codeanchors:
  - backend/modules/
---

# Context, Container, Storage, API Resources

---

## Context

`Illuminate\Support\Facades\Context` carries metadata through the whole execution lifecycle —
including across the queue boundary, via its `dehydrate()` / `hydrate()` mechanism.

```php
Context::add('request_uuid', $requestUuid);
Context::add('branch_id', $branch->getKey());
Context::addHidden('actor_email', $user->email);   // not written to logs
```

Then every log entry in that request **and in any job dispatched from it** carries the same
metadata, without threading it through constructors.

Useful methods (verified in `Log/Context/Repository.php`): `add()`, `addIf()`, `addHidden()`,
`remember()`, `push()`, `pop()`, `increment()`, `get()`, `only()`, `except()`, `forget()`,
`scope()`, `stackContains()`.

**How this fits this repo.** `Modules\Core\Services\LoggerService` is the canonical logging
entry point and `AssignRequestUuidMiddleware` + `LoggerService::enrichContext()` already attach
`request_uuid` to every log line — keep using it (see `logging-and-tracing`). Where `Context`
adds something the current setup does not: that middleware-set UUID does not follow a queued
job, but Context does. Prefer `Context::add()` for anything that must remain traceable after
the response, and let `LoggerService` keep owning message shape.

Do not paste the same `['branch_id' => ..., 'request_uuid' => ...]` array onto twenty log
calls. That is what Context is for.

Do not build a new logger wrapper around Laravel's channels — the project already has one, and
`config/logging.php` owns channels, formatters, and stack composition.

---

## Continued in

- [Part 2: Container and dependency injection](context-container-resources-part-2.md)
- [Part 3: Storage and uploads](context-container-resources-part-3.md)
- [Part 4: API Resources](context-container-resources-part-4.md)
