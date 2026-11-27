---
nodeid: mobile.apps.client-app.runtime.app-lifecycle
parentnode: mobile.apps.client-app
childnodes:
  - mobile.apps.client-app.runtime.app-lifecycle.part-2
  - mobile.apps.client-app.runtime.app-lifecycle.part-3
  - mobile.apps.client-app.runtime.app-lifecycle.part-4
codeanchors:
  - frontend/mobile/apps/client_app/lib/
---

# Application Lifecycle — Dorak Client App (`apps/client_app`)

Mobile documentation: [index](../../../../docs/index.md).

---

## 1. What this covers

Exactly one behaviour: **when the app returns to the foreground it re-probes the
stored session token.**

Nothing else about the lifecycle is handled here. There is no background task
scheduling, no data refresh on resume, no analytics session boundary, no
connectivity listener. Those are separate tracks and MUST NOT be folded into
this observer.

## 2. Why it exists

Before this, a session was only re-checked at two moments:

1. **Cold start** — `SessionBloc.ready` dispatches `RestoreRequested`.
2. **Mid-request 401** — `ApiClient.unauthorizedStream` → `UnauthorizedDetected`.

Both leave the same hole. A token can expire or be revoked server-side while the
app sits in the background — a Sanctum token deleted by an admin, a password
reset elsewhere, a `SANCTUM_EXPIRATION` window elapsing. On resume the app has no
idea. It keeps rendering authenticated UI, with authenticated affordances, until
the user happens to trigger a request that returns 401.

The resume probe closes that hole by re-running the check the app already trusts
at cold start, at the one other moment the client can know time has passed.

## Continued in

- [Part 2: 3. Implementation](app-lifecycle-part-2.md)
- [Part 3: The two guards](app-lifecycle-part-3.md)
- [Part 4: 5. Tests](app-lifecycle-part-4.md)
