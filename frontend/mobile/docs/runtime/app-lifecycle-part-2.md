---
nodeid: mobile.runtime.app-lifecycle.part-2
parentnode: mobile.runtime.app-lifecycle
childnodes: []
codeanchors:
  - frontend/mobile/apps/client_app/lib/
---

Part 2 of 2 · [Application Lifecycle](app-lifecycle.md) · [Previous](app-lifecycle.md)

## Event coverage

| `AppLifecycleState` | Handled | Why |
|---|---|---|
| `resumed` | ✅ probe the session | session may have died while backgrounded |
| `inactive`, `hidden`, `paused` | ❌ deliberately ignored | nothing to tear down; state survives backgrounding by design |
| `detached` | ❌ deliberately ignored | owned by `dispose()` |

Only `resumed` is of interest today. Adding per-event behavior (e.g. suspending
uploads on `paused`) is Track 13/14 work — see
`docs/state-management/background_operations.md`.

The listener is created **once in `initState`**, never in `build`, so ordinary
rebuilds do not attach duplicate observers (guarded by a test).

## Evidence — `apps/client_app/test/widget_test.dart`, group `application lifecycle`

| Test | Proves |
|---|---|
| resuming from the background re-probes the session | 1 startup probe → background round-trip → 1 more probe (2 total) |
| each resume re-probes exactly once | N resumes → N probes — no duplicate observer |
| ordinary rebuilds do not re-probe | 5 frames of pumping → count unchanged |
| a resume while the startup restore is unresolved is ignored | gated restore; resume while `unknown` → probe count still 1 |
| a resume after the token was revoked resolves to guest | `refreshTokenError = unauthorized()` on resume → guest, no route replacement (same cold-start contract as `session_expired_test.dart`) |

## Related

- `docs/flows/app-launch.md` — bootstrap + the launch gate (the cold-start path;
  resume is the warm path, same `RestoreRequested`).
- `docs/core/session.md` — `SessionBloc` restore matrix and the
  `unknown | authenticated | guest` statuses the guard reads.
- `apps/client_app/lib/app.dart` — the one place lifecycle is wired.
