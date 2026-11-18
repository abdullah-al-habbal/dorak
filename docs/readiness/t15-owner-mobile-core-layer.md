---
nodeid: docs.readiness.t15
parentnode: docs.readiness
childnodes: []
codeanchors:
  - frontend/mobile/packages/core/
---

# T15. Brand owner core layer (`packages/core`)

Status: done · Phase 6 · Depends on: T14, T8

- [x] T15.1 `owner.endpoints.dart` (domain-split, exported through the barrel) for the `owner/*` routes.
- [x] T15.2 DTOs and entities for the owner profile, brand, branch, subscription and payout, with safe fallbacks for unknown enum values (TD-3 rule).
- [x] T15.3 `owner.repository.dart` using the existing `ApiClient`; owner login reuses the client auth repository and token storage.
- [x] T15.4 Session role resolution: after client login, `GET owner/me` decides whether the user is a brand owner or an ordinary client; a client without a brand gets a clear "web registration" result, not a crash.
- [x] T15.5 Contract tests against fake Dio for each route and the 401, 403 and 422 paths.

Acceptance: `business_app` can call every owner route through typed repositories; `packages/core` stays free of UI and app imports; `melos verify` passes.

## Implementation notes

- Brand creation, branch delete, stylists, earnings and bookings are not wrapped: the owner screens of T16 do not use them in this phase (the backend routes for stylists and earnings exist).
- `OwnerBranchDto.status` and the subscription and payout states stay strings so new backend values never break a list; only the brand status is an enum with an `unknown` fallback because the banners branch on it.
- Tests: `core/test/owner_repository_test.dart` (12): role resolution (owner, no brand, unknown status, 401 and 403), brand read, update, resubmit and 422, branches (string or map names, decimals, create, switch, 403 `brand_not_approved`), billing, owner services path.
