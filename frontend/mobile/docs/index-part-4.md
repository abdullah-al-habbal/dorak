---
nodeid: mobile.docs.part-4
parentnode: mobile.docs
childnodes: []
codeanchors:
  - frontend/mobile/apps/
  - frontend/mobile/packages/
---

Part 4 of 13 · [Dorak Mobile — AI Execution Index](index.md) · [Previous](index-part-3.md) · [Next](index-part-5.md)

## 4. Documentation Map

The repository-wide [documentation graph](../../../docs/index.md) catalogs every
maintained Markdown document by folder. This mobile index routes into the
current topic docs; it does not list planned files that have not been created.

- Architecture: [coding conventions](architecture/coding-conventions.md) and [architecture decisions](architecture/decisions/0001-bloc-in-core.md).
- Core runtime: [networking](core/networking.md), [session](core/session.md), [runtime lifecycle](runtime/app-lifecycle.md), and [realtime](realtime/reverb.md).
- State and navigation: [state management](state-management/index.md), [routes](navigation/routes.md), and [guards](navigation/guards.md).
- Product flows: [authentication](authentication/auth-flow.md), [onboarding](flows/onboarding.md), and [guest access](flows/guest-access.md).
- Design: [design-system index](design-system/index.md) and [password recovery screen](screens/authentication/forgot-password.md).
- Verification: use the package and app verification instructions in [mobile guide](../AGENTS.md).

---

# 5. Implementation Tracks

Only open tracks are listed; completed tracks (00–04, 06–08, 10, 16) are shipped and recorded in git history and [the feature index](feature-index.md). Track 05 keeps its single open item.

## Track 05 — Storage

**Status:** `DONE` (2026-09-02)

Objectives:

* Secure credentials/tokens. — `DONE` (`TokenStorage` / `SecureTokenStorage`)
* Local preferences. — `DONE` (`AppPreferences` / `SharedAppPreferences`)
* Onboarding persistence. — `DONE`
* `"Don't show again"` persistence. — `DONE`
* Profile-completion persistence. — `PENDING` (blocked on Track 17)
* Cache strategy. — `DONE` (`FeedCache` / `SharedFeedCache`, raw-wire-payload
  feed cache; bounded keys = universe + lat/long 3-dp + 5 km radius bucket +
  per_page; read-time staleness via `FeedCacheEntry.isStale`,
  `feedCacheTtl` = 30 min; explicit `evict`/`clear`; corrupt payloads → null).

**Evidence.** 11 tests in `packages/core/test/feed_cache_test.dart` (key
bucketing incl. same-neighbourhood sharing; write/read/evict/clear round-trips;
staleness against an injected clock; corrupt payload → null). Full gate:
`dart run melos run verify` exit 0, **168 tests** (core 72 → 83,
re-baselined 2026-09-02).

The cache's first consumer is the Discovery feed — the wait-for-consumer caveat that kept this track
deferred is resolved: the envelope it stores was derived from the real backend
`/explore/branches` contract, and Discovery (Track 18) reads it.

Documentation: `docs/core/storage.md`.

Implementation target:

```text
packages/core
```

---
