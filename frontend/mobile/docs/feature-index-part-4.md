---
nodeid: mobile.feature-index.part-4
parentnode: mobile.feature-index
childnodes: []
codeanchors:
  - frontend/mobile/apps/client_app/lib/
---

Part 4 of 5 · [Feature Index — Dorak Mobile (Flutter Monorepo)](feature-index.md) · [Previous](feature-index-part-3.md) · [Next](feature-index-part-5.md)

## Business App (`apps/business_app`)

- Skeleton only — `main.dart` boots `DorakApp`, no features yet.

---

## Stylist App (`apps/stylist_app`)

- Skeleton only — `main.dart` boots `DorakApp`, no features yet.

---

## Stitch Migration Status

Each export is flagged ✅ **Migrated** (implemented in Flutter, verified by `flutter analyze` + `flutter test` + `tool/check_taxonomy.dart`, export folder deleted) or ⏳ **Pending** (folder still in `docs/stitch/exports/`).

| Export | Screen | Feature | Status |
|--------|--------|---------|--------|
| 001 | Splash | CL-01 | ✅ Migrated |
| 002 | Onboarding Welcome | CL-02 | ✅ Migrated |
| 003 | Onboarding Discovery | CL-03 | ✅ Migrated |
| 004 | Onboarding Booking | CL-04 | ✅ Migrated |
| 005 | Onboarding AI Showcase | CL-05 | ✅ Migrated |
| 006 | Authentication Entry | CL-08 | ✅ Migrated |
| 007 | Login | CL-08 | ✅ Migrated |
| 008 | Create Your Account | CL-08 | ✅ Migrated |
| 009 | Verify Your Account | CL-08 | ✅ Migrated |
| 010 | Complete Your Profile | CL-08 | ✅ Complete |
| 011 | Forgot Password | CL-08 | ✅ Migrated |
| 012 | Forgot Password OTP | CL-08 | ✅ Migrated |
| 013 | Create New Password | CL-08 | ✅ Migrated |
| 014 | Password Reset Success | CL-08 | ✅ Migrated |
| 016 | Discovery Feed | CL-09 | ✅ Complete |
| 017a | My Bookings (list/filter/cancel) | CL-10 | ✅ Complete |
| 017b | Branch Floor Plan & Booking creation | CL-10 | ✅ Complete |
| 018a | Service History & Rebook | CL-11 | ✅ Complete |
| 018b | Face Analysis & AI Style (face analysis + AI recs) | CL-11 | ✅ Complete |
| 019 | Stylist Profile | CL-12 | ✅ Complete |
| 020 | Review & Rating | CL-13 | ✅ Complete |

> Note: `015_design.md` is a standalone design doc (not a screen export).

---
