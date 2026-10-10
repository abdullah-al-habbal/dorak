# Feature Index — Dorak Business App (`apps/business_app`)

> **Append entry after adding each feature.** Monorepo-wide index: [`docs/feature-index.md`](../../docs/feature-index.md).

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

### Not Started
- Remaining business features (branch/brand management, bookings, staff, reports) — not yet specced or built.
