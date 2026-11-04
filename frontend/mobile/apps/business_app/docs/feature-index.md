---
nodeid: mobile.apps.business-app.feature-index
parentnode: mobile.apps.business-app
childnodes: []
codeanchors:
  - frontend/mobile/apps/business_app/lib/
---

# Feature Index — Dorak Business App (`apps/business_app`)

> **Append entry after adding each feature.** Monorepo-wide index: [`docs/feature-index.md`](../../../docs/feature-index.md).

---

### Bootstrap
- `lib/main.dart` — `DorakApp` entry point only.

### Features
- `lib/src/features/barbers/manual_barber.{bloc,event,state,screen}.dart` — branch manager manual barber creation with E.164 phone normalization.

---

## Business Feature Registry

| # | Feature | Status | Source |
|---|---------|--------|--------|
| BU-01 | App bootstrap | ✅ Complete | — |
| BU-02 | Manual barber creation | ✅ Complete | `POST /branch/barbers` |
| BU-10 | Staff list with activate/deactivate (G10) | ✅ Complete | `features/staff/` |
| BU-11 | Services CRUD (G10) | ✅ Complete | `features/services/` |
| BU-12 | Working hours (G10) | ✅ Complete | `features/hours/` |
| BU-13 | Notification inbox (G10) | ✅ Complete | `features/inbox/` |
| BU-14 | Bottom-navigation shell + More tab (G10) | ✅ Complete | `core/navigation/widgets/`, `features/more/` |
| BU-15 | Branch earnings (G11) | ✅ Complete | `features/earnings/` |

### G10/G11 status
All G10/G11 business features (staff, services, working hours, inbox, bottom-navigation shell, earnings) are implemented and covered by bloc and widget tests: `test/business_g10_g11_blocs_test.dart`, `business_g10_g11_screens_test.dart` (earnings, More, inbox, staff), `business_hours_services_screens_test.dart` (hours, services list, service form) and `business_earnings_bloc_test.dart`.

### Not Started
- Brand management, bookings and reports are outside the G10/G11 scope and not yet specced.
