---
nodeid: mobile.apps.client-app
parentnode: mobile.guide
childnodes:
  - mobile.apps.client-app.claude
  - mobile.apps.client-app.feature-index
  - mobile.apps.client-app.readme
  - mobile.apps.client-app.references.bootstrap-and-flows
  - mobile.apps.client-app.references.decisions
  - mobile.apps.client-app.references.feature-status
  - mobile.apps.client-app.references.tests
  - mobile.apps.client-app.references.verification
  - mobile.apps.client-app.runtime.app-lifecycle
  - mobile.apps.client-app.part-2
codeanchors:
  - frontend/mobile/apps/client_app/lib/
---

# AGENTS.md — `apps/client_app`

The end-user app. Splash → launch gate → auth or onboarding → Home.

Parent: [`../../AGENTS.md`](../../AGENTS.md) · Rules: [`CLAUDE.md`](./CLAUDE.md)
· Files: [`docs/feature-index.md`](./docs/feature-index.md)

**This app's Dart source has zero comments.** Every non-obvious decision is in
§7. Read it before "simplifying" anything.

---

## 1. Layout

```
lib/main.dart                     binding init, dotenv, prefs, runApp
lib/app.dart                      DorakApp — all DI wiring lives here
lib/src/core/navigation/
  app.router.dart              AppRouter — go_router table, redirects, flow wiring
  app_routes.entity.dart       AppRoutes — path constants
  app_gate.entity.dart         AppGate.resolve — the post-splash branch
lib/src/features/
  splash/                         splash.screen.dart + 2 widgets
  auth/                           9 screens + 12 widgets + 3 entities
                                  + password_recovery bloc/event/state (011–014)
                                  + change_password bloc/event/state + screen (Track 17)
  onboarding/                     4 screens + 9 widgets + config bloc
  discovery/                      discovery.{bloc,event,state}.dart + filter entity + screen + 2 widgets (016 feed)
  booking/                        booking.{bloc,event,state}.dart + screen + card (017a list/cancel)
                                  branch_detail.{bloc,event,state}.dart + screen + FloorPlanGrid widget (017b detail/create)
  profile/                        profile.screen.dart (018a: header card + change-password entry + Service History; 018b: avatar header + Face Analysis card + Curated For You)
                                  history.{bloc,event,state}.dart (018a: paged feed + rebook)
                                  face_analysis.{bloc,event,state}.dart (018b: upload → pending → re-check, curated via catalog paging)
                                  avatar.{bloc,event,state}.dart (018b: upload → avatarUrl)
                                  photo_picker.provider.dart + image_picker_photo_picker.provider.dart (018b: PhotoPicker seam + image_picker impl)
  stylist/                         stylist_profile.{bloc,event,state}.dart + screen (019: profile from branch-detail barbers entry, `/discover/barber/:barberId`)
lib/src/core/di/ theme/           empty
assets/images/                    noise_overlay.png, onboarding_hero.jpg
```

## Continued in

- [Part 2: More](agents-part-2.md)
