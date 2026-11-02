---
nodeid: mobile.state-management.part-2
parentnode: mobile.state-management
childnodes: []
codeanchors:
  - frontend/mobile/packages/core/lib/
---

Part 2 of 2 · [State Management](index.md) · [Previous](index.md)

## Current blocs

| Bloc | Location | State |
|---|---|---|
| `SessionBloc` | `packages/core/lib/src/session/` | `SessionState` + `SessionSignal` |
| `AuthBloc` | `packages/core/lib/src/session/` | `AuthState` + `AuthSignal` |
| `LocaleBloc` | `apps/client_app/lib/src/core/locale/` | `Locale` — see the exemption below |
| `OnboardingConfigBloc` | `apps/client_app/lib/src/features/onboarding/` | `OnboardingConfigState` |

### The single-value-state exemption

`LocaleBloc` is `Bloc<LocaleEvent, Locale>` and has no `.state.dart`. This is
sanctioned, not an oversight: a bloc whose entire state is one value-equal type
may use that type directly. The `.bloc`/`.event`/`.state` triple names files
that exist; it is not a mandate to create wrapper classes. Full rule and the
conversion trigger: [`conventions.md`](./conventions.md) §1a.

## Why `background_operations.md` is empty

Nothing in Dorak performs background work — no upload queue, no scheduler, no
isolate, no background fetch. Writing a contract for it would be fiction, and a
future agent would follow it. The file stays empty until Track 13 (File & Media
Infrastructure) creates something real to describe.

## Open items

| Item | Status |
|---|---|
| Pagination contract validated by a real feature | **pending** — `Paged<T>` exists and is tested, but has no consumer until Discovery (016) |
| `bloc_concurrency` for cancellation (`restartable()`) | **pending a consumer** — added with the first search field, not before |
| Global loading / empty / error / offline / retry **widgets** | Track 12 — this track defines state, not UI components |

## Verification

```bash
cd frontend/mobile
dart run melos run verify
```
