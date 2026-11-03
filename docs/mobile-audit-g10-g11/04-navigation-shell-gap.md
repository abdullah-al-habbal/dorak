---
nodeid: docs.mobile_audit_g10_g11.navigation_shell
parentnode: docs.mobile_audit_g10_g11
childnodes: []
codeanchors:
  - frontend/mobile/apps/business_app/
  - frontend/mobile/apps/stylist_app/
  - frontend/mobile/packages/core/
---

# 04: Navigation shell gap

Routes: [index](index.md).

**Status:** Open.

## Finding
- `business_app` (`app.router.dart`) has 11 routes and no `ShellRoute`. The only entry points are an AppBar popup menu (Jobs, Floor plan, Affiliations, Profile, Reviews), a logout icon, an add-barber icon and a locale toggle.
- `stylist_app` has `/home` with child routes and a row of `ActionChip`s on `StylistScreen`.
- Neither router has a `refreshListenable`. The auth redirect only runs on navigation, and logout and unauthorized events call `router.go` from `app.dart`.

## Impact
Adding hours, staff, inbox, services and history to a popup menu or chip row does not scale and hides the inbox badge.

## Proposed work
Add a `ShellRoute` with a bottom navigation bar in each app, give the routers a `refreshListenable` tied to the session bloc, and keep screens in their existing feature folders. Use the shared `frontend-design` and `interface-design` skills and record choices in `.interface-design/system.md`.

Do this before the new feature screens.
