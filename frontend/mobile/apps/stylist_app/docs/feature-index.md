---
codeanchors:
  - frontend/mobile/apps/stylist_app/lib/
---

# Feature Index — Dorak Stylist App (`apps/stylist_app`)

> A log of what was built: an entry describes the feature when it was added. The code decides what exists now.

> **Append entry after adding each feature.** Monorepo-wide index: [`docs/feature-index.md`](../../../docs/feature-index.md).

---

### Bootstrap
- `lib/main.dart` — bootstrap; `lib/app.dart` holds `StylistApp`.

### Features
- Auth and sign-up, today/operations, schedule, portfolio, profile, affiliations, jobs. See [`AGENTS.md`](../AGENTS.md).

---

## Stylist Feature Registry

| # | Feature | Status | Source |
|---|---------|--------|--------|
| ST-01 | App bootstrap | ✅ Complete | — |
| ST-02 | Cancel booking with reason | ✅ Complete | Task 83 |
| ST-03 | Weekly schedule editor | ✅ Complete | Task 83 |
| ST-04 | Portfolio grid (upload/delete) | ✅ Complete | Task 83 |
| ST-05 | Profile bio and travel radius | ✅ Complete | Task 83 |
| ST-06 | Affiliations accept/reject | ✅ Complete | Task 83 |
| ST-07 | Jobs, apply, my applications | ✅ Complete | Task 83 |
| ST-08 | Client history + tagged photo upload (Gap G1) | ✅ Complete | `features/history/` |
| ST-09 | Past appointments (G11) | ✅ Complete | `features/appointments/` |
| ST-10 | Earnings (G11) | ✅ Complete | `features/earnings/` |
| ST-11 | Services and pricing editor (G11) | ✅ Complete | `features/services/` |
| ST-12 | Notification inbox (G11) | ✅ Complete | `features/inbox/` |
| ST-13 | Bottom-navigation shell + More tab (G11) | ✅ Complete | `core/navigation/widgets/`, `features/more/` |

### G10/G11 status
All G10/G11 stylist features (past appointments, earnings, services and pricing editor, inbox, bottom-navigation shell) are implemented and covered by `test/stylist_g10_g11_blocs_test.dart`, `stylist_g10_g11_screens_test.dart` and `stylist_services_screens_test.dart` (services list and service form).
