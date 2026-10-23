---
name: cqrs-pattern
description: CQRS pattern implementation with Command/Query objects flowing through Action -> Handler -> EloquentResolver. Use whenever building a read or write endpoint — actions build command/query objects, handlers contain logic, resolvers access data.
---

# CQRS pattern

## Flow

```
Request (validates input)
  → builds Command (mutation) or Query (read) object
    → Action (invokable, extends BaseApiAction)
      → Handler (contains business logic)
        → EloquentResolver (single query/mutation method)
      → Response via ApiResponseTrait
```

Commands mutate state. Queries read state. Both flow through the same Action → Handler → Resolver pipeline.


## Worked examples

| Topic | Read |
| --- | --- |
| Read side: Query → Resolver → Handler → Action | [`references/read-example.md`](references/read-example.md) |
| Write side: Command → Request → Handler → Action | [`references/write-example.md`](references/write-example.md) |

## Key rules

- Commands in `CQRS/Command/`, Queries in `CQRS/Query/`.
- Handlers in `Handlers/`, Resolvers in `Eloquent/Resolvers/`.
- Resolver has exactly one `resolve()` method — single query/mutation per class.
- Handler is the only class that calls the resolver. Action never calls resolver directly.
- Request validation happens before `toCommand()`/`toQuery()` — payload is always valid.
