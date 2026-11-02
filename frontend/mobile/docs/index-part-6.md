---
nodeid: mobile.docs.part-6
parentnode: mobile.docs
childnodes: []
codeanchors:
  - frontend/mobile/apps/
  - frontend/mobile/packages/
---

Part 6 of 13 · [Dorak Mobile — AI Execution Index](index.md) · [Previous](index-part-5.md) · [Next](index-part-7.md)

## Track 11 — Navigation

**Status:** `IN_PROGRESS`

Objectives:

* Route definitions. — `DONE`. go_router route table in
  `app.router.dart` (`AppRouter`) + `app_routes.entity.dart`. Navigator 1.0
  and `.navigator.dart` coordinators were **removed in Phase 2**.
* Nested navigation. — `PENDING`
* Authentication guards. — `PARTIAL`. The launch gate (`AppGate.resolve`,
  installed as the router redirect) guards entry into the app; there are no
  per-route guards.
* Guest guards. — `PENDING`
* Profile-completion guards. — `PENDING` (blocked on Track 17)
* Deep links. — `PENDING`
* Notification-driven navigation. — `PENDING`

Documentation: `docs/navigation/routes.md`, `docs/navigation/guards.md`.

Implementation target:

```text
apps/*/src/core/navigation/
```

---

## Track 12 — Global UI States

**Status:** `IN_PROGRESS` — the state components exist and are tested
(`StatusView`, `AppLoader`, `ShimmerBox`, `StatusBanner`), but only
`StatusBanner` has production consumers today. The track stays `IN_PROGRESS`
until Discovery 016 consumes the other three; if 016 finds a component does
not fit, change the component, do not work around it.

Objectives:
