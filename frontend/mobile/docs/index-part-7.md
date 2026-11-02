---
nodeid: mobile.docs.part-7
parentnode: mobile.docs
childnodes: []
codeanchors:
  - frontend/mobile/apps/
  - frontend/mobile/packages/
---

Part 7 of 13 · [Dorak Mobile — AI Execution Index](index.md) · [Previous](index-part-6.md) · [Next](index-part-8.md)

Implement reusable:

* Full-page loading. — `DONE` (`AppLoader.page()` — `docs/design-system/components/loading/fullscreen.md`)
* Inline loading. — `DONE` (`AppLoader.inline()` — `docs/design-system/components/loading/inline.md`)
* Button loading. — `DONE` (`PrimaryButton.isLoading` — was already implemented and used by every auth form; the earlier `PENDING` status was a recording error. `SecondaryButton` deliberately has no `isLoading` — no consumer needs it)
* Shimmer. — `DONE` (`ShimmerBox`, hand-rolled, no package — `docs/design-system/components/shimmer/text.md`)
* Empty. — `DONE` (`StatusView` — `docs/design-system/states/empty.md`)
* Error. — `DONE` (`StatusView` full-page, `StatusBanner` inline; `AuthError.from` stays in the app — `docs/design-system/states/network-error.md`)
* Offline. — `DONE` (presentation variant of error; no connectivity package — `docs/design-system/states/offline.md`)
* Retry. — `DONE` (an action on `StatusView`/`StatusBanner`, not a widget — `docs/design-system/states/retry.md`)
* Session expired. — `DONE` (401/403 on an authenticated request →
  `ApiClient.unauthorizedStream` → `SessionBloc.add(UnauthorizedDetected())` →
  auth entry)
* Authentication required. — `DONE` (guest action adds `RequireAuthentication`
  → auth entry pushed on top; mechanism tested, **nothing in production
  dispatches it yet** — first producer will be Discovery 016)
* Permission required. — `PENDING` **deferred deliberately**: no permission
  mechanism exists in the workspace (no `permission_handler`, `geolocator`, or
  `connectivity_plus`) and there is no consumer. Ownership is open between
  Tracks 13/14 ;
  016's location-permission needs will trigger it. Do not build a permission
  visual without a mechanism.

Implementation targets:

```text
packages/core     # ApiClient.unauthorizedStream + SessionBloc signals
apps/*            # AppRouter listener redirects to /auth on sessionExpired
packages/design_system
```


---
