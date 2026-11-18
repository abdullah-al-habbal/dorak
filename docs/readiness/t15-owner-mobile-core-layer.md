---
nodeid: docs.readiness.t15
parentnode: docs.readiness
childnodes: []
codeanchors:
  - frontend/mobile/packages/core/
---

# T15. Brand owner core layer (`packages/core`)

Status: todo · Phase 6 · Depends on: T14, T8

- [ ] T15.1 `owner.endpoints.dart` (domain-split, exported through the barrel) for the `owner/*` routes.
- [ ] T15.2 DTOs and entities for the owner profile, brand, branch, subscription and payout, with safe fallbacks for unknown enum values (TD-3 rule).
- [ ] T15.3 `owner.repository.dart` using the existing `ApiClient`; owner login reuses the client auth repository and token storage.
- [ ] T15.4 Session role resolution: after client login, `GET owner/me` decides whether the user is a brand owner or an ordinary client; a client without a brand gets a clear "web registration" result, not a crash.
- [ ] T15.5 Contract tests against fake Dio for each route and the 401, 403 and 422 paths.

Acceptance: `business_app` can call every owner route through typed repositories; `packages/core` stays free of UI and app imports; `melos verify` passes.
