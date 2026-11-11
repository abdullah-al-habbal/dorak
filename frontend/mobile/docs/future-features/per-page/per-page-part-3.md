---
nodeid: mobile.future-features.per-page.per-page.part-3
parentnode: mobile.future-features.per-page.per-page
childnodes: []
codeanchors:
  - frontend/mobile/apps/client_app/lib/
---

Part 3 of 3 · [Backend-Driven Default Page Size (pagination.per_page)](per-page.md) · [Previous](per-page-part-2.md)

## Client — `packages/core` + `apps/client_app`

### Fetch on app start

* New `AppSettingsRepository` + `DioAppSettingsRepository` in
  `packages/core` (dot-suffix `.repository.dart`), endpoint in
  `app.endpoints.dart` (`appSettings`).
* New `SettingsBloc` (pure `bloc`, `.bloc.dart`/`.event.dart`/`.state.dart`)
  constructed at bootstrap in `apps/client_app/lib/main.dart` (mirror of
  `OnboardingConfigBloc`). Requests only needed keys, e.g.
  `['pagination.per_page']`.
* Default `perPage`: `pagination.per_page` from settings, falling back to
  `15` while loading or on failure (never blocks startup).

### Wire into pagination

> The legacy pagination `ChangeNotifier`s were deleted (see
> `state-management/pagination.md`). The `perPage` default belongs on the
> feature's pagination Bloc.

* The feature pagination Bloc keeps an optional `perPage` parameter (explicit
  callers still override), but defaults it from the settings bloc instead of a
  literal:

```dart
final pager = FeedBloc(
  fetch: repository.fetchBranches,
  perPage: appSettings.paginationPerPage, // default 15 while unknown
);
```

* No change to `ApiClient.getPaginated` — it already forwards
  `queryParameters` including `per_page`.

## Acceptance Criteria

1. `pagination.per_page` seeded in backend; endpoint returns it.
2. App fetches settings once at startup; pagination uses server `per_page`.
3. Server value change (e.g. 15 → 20) takes effect after next app start with
   no client release.
4. Settings fetch failure → client falls back to 15, feature degrades
   gracefully.

## Out of Scope

* Admin UI for editing settings (dashboard screen or settings page) — can be
  a follow-up; seeding suffices initially.
* Additional keys beyond `pagination.per_page`.

## Verification (when implemented)

```bash
melos run verify
```

plus backend tests for the settings endpoint (filter, clamping, public-only).
