---
nodeid: skills.repo.stitch-flutter-converter.templates.data-screen-scaffold
parentnode: skills.repo.stitch-flutter-converter
childnodes: []
codeanchors:
  - frontend/mobile/
---

# Data-backed screen scaffold (use for anything that loads backend data)

```
apps/<app>/lib/src/features/<feature>/
  <feature>.bloc.dart            // Bloc<Event, State>
  <feature>.event.dart           // sealed events: Started, Refreshed, FilterChanged, NextPageRequested, Retried
  <feature>.state.dart           // Equatable: status (loading/ready/empty/error), items, hasMore, error, filters
  <feature>.screen.dart          // BlocBuilder; callbacks wired by the router
  widgets/<piece>.widget.dart    // one class per file
packages/core/lib/src/network/   // <feature>.endpoints.dart, <feature>.dto.dart (+ .g.dart), <feature>.repository.dart
```

Checklist:
- [ ] Repository contract in `core`; Dio implementation; DTO via `json_serializable`; endpoint file split by domain.
- [ ] Bloc registered in `app.dart` DI and disposed; the route added to `app.router.dart` + `app_routes.entity.dart`.
- [ ] States: loading (shimmer/loader), empty, error with retry, offline, pull-to-refresh, pagination, guest access as the plan states.
- [ ] No navigation inside the Bloc; screens take callbacks or use `context.push/go/pop`.
- [ ] All strings via `AppLocalizations`; colors/typography via tokens.
- [ ] Bloc test + flow test + repository test written.
