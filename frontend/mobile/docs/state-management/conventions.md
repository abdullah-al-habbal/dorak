---
codeanchors:
  - frontend/mobile/packages/core/lib/
---

# State Management Conventions

Status: `DONE` — this is the canonical contract for all Dorak state.

Architecture: **Pure Bloc** + **go_router**. Locked. See
[ADR 0001](../architecture/decisions/0001-bloc-in-core.md) for why blocs are
permitted in `packages/core`.

Prohibited everywhere, without exception: **Cubit**, **`ChangeNotifier`
application state**, **Provider**, **Riverpod**, **GetIt** or any service
locator. `provider` appears in the lock file only as a transitive dependency of
`flutter_bloc` (its `InheritedWidget` plumbing) — never import it.

Many feature classes use `Cubit` today. Whether this ban stays is open: backlog BD-17.

---

## 1. Bloc

1. One bloc per concern. Files: `<subject>.bloc.dart`, `<subject>.event.dart`,
   `<subject>.state.dart`.
2. Every state change is an event. There is no Cubit and no direct setter.
3. **Shared infrastructure blocs live in `packages/core`** using pure `bloc`
   (`SessionBloc`, `AuthBloc`). **Feature blocs live in their owning app or
   feature package** and may use `flutter_bloc`. Core never gets `flutter_bloc`
   or `go_router`.
4. A bloc owns exactly one concern. `SessionBloc` (global session truth) versus
   `AuthBloc` (active auth operations) is the reference split.
5. Dependency injection is constructor wiring in `DorakApp.initState`. There is
   no container.

### 1a. The single-value-state exemption

> **A bloc whose entire state is one value-equal type may use that type
> directly as its state, and omit `.state.dart`.**

The `.bloc`/`.event`/`.state` triple is a naming convention for files that
exist. `tool/check_taxonomy.dart` validates the names of files present; it never
requires the triple to be complete. **Do not create a wrapper class only to
satisfy the pattern.**

`LocaleBloc` is the sanctioned instance:

```dart
class LocaleBloc extends Bloc<LocaleEvent, Locale>
```

## Continued in

- [Part 2: 2. Events](conventions-part-2.md)
- [Part 3: 5. Retry](conventions-part-3.md)
- [Part 4: 8. Concurrency and event ordering](conventions-part-4.md)
- [Part 5: 10. UI interaction](conventions-part-5.md)
