---
nodeid: mobile.apps.client-app.runtime.app-lifecycle.part-4
parentnode: mobile.apps.client-app.runtime.app-lifecycle
childnodes: []
codeanchors:
  - frontend/mobile/apps/client_app/lib/
---

Part 4 of 4 · [Application Lifecycle — Dorak Client App (apps/client_app)](app-lifecycle.md) · [Previous](app-lifecycle-part-3.md)

## 5. Tests

`test/widget_test.dart`, group `application lifecycle` — the only test that pumps
the real `DorakApp`, which is where the listener lives.

Observability comes from `FakeAuthRepository.refreshTokenCalls` in
`test/helpers/fakes.dart`. One `RestoreRequested` with a stored token calls
`refreshToken` exactly once, so a restore is counted, never timed. No pixel
assertions, no `pump` duration tuning.

| Test | Asserts |
|---|---|
| resuming from the background re-probes the session | 1 call after startup, 2 after one resume |
| each resume re-probes exactly once | 1 → 2 → 3 → 4; a duplicate observer would double each step |
| ordinary rebuilds do not re-probe | count stays 1 across five pumped frames |
| a resume while the startup restore is unresolved is ignored | count stays 1 — the `unknown` guard |
| a resume after the token was revoked resolves to guest | probe runs, route is not replaced (the §4 contract) |

The unresolved-startup test gates the fake with
`FakeAuthRepository.refreshTokenGate`, a `Completer` that is null by default so no
other test's timing changes.

Resume transitions are driven with the full legal chain
`inactive → hidden → paused → hidden → inactive → resumed`; the framework rejects
illegal jumps and `onResume` is edge-triggered, so both directions must be walked.

**Verified against the unfixed code.** With the listener reverted, 3 of the 5 fail
(`Expected: <2> Actual: <1>`). The other 2 assert an *absence* of probes and pass
trivially without the feature — they guard the guards, not the feature.

## 6. Known limitation — not in scope

A resume probe that finds a revoked token leaves the user on an authenticated
route showing guest state. Fixing that means either:

- raising `sessionExpired` from `_onRestore` — changes authentication logic and
  breaks the cold-start contract in §4, or
- adding a per-route authentication guard — **Track 11**.

The second is correct and is deferred to that track. Recorded here so it is not
rediscovered as a bug.

## 7. Not implemented

- `business_app` and `stylist_app` — untouched. Track 10 lists their bootstrap as
  outstanding; the lifecycle observer follows their bootstrap, not before it.
- Resume-time data refresh for any feature.
- Background task scheduling / `onDetach` teardown.
- Connectivity or offline detection on resume.
