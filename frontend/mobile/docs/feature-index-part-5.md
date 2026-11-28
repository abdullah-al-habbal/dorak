---
codeanchors:
  - frontend/mobile/apps/client_app/lib/
---

Part 5 of 5 · [Feature Index — Dorak Mobile (Flutter Monorepo)](feature-index.md) · [Previous](feature-index-part-4.md)

## Feature Registry

All Flutter features built, verified, and passing the gate (`melos run verify`: generate → build → analyze → taxonomy → test).

| # | Feature | App / Pkg | Status | Source |
|---|---------|-----------|--------|--------|
| FE-01 | Design Tokens (colors/typography/dimensions) | design_system | ✅ Complete | Track 01 |
| FE-02 | Themes & Semantics | design_system | ✅ Complete | Track 02 |
| FE-03 | Localization Foundation (EN + AR) | localization | ✅ Complete | Track 03 |
| FE-04 | Networking + Interceptors + DTO contracts | core | ✅ Complete | Tracks 07–08 |
| FE-05 | Splash Screen | client_app | ✅ Complete | Stitch 001 |
| FE-06 | Onboarding — Welcome | client_app | ✅ Complete | Stitch 002 |
| FE-07 | Onboarding — Discovery | client_app | ✅ Complete | Stitch 003 |
| FE-08 | Onboarding — Booking | client_app | ✅ Complete | Stitch 004 |
| FE-09 | Onboarding — AI Showcase | client_app | ✅ Complete | Stitch 005 |
| FE-10 | Onboarding Infrastructure (config fetch, skip sheet, flow) | client_app | ✅ Complete | — |
| FE-11 | Home placeholder | client_app | ✅ Complete | — |
| FE-12 | Floor Plan package | — | Removed (Task 86): client widgets stay in `client_app` | — |
| FE-13 | Storage (secure token + preferences) | core | ✅ Complete | Track 05 |
| FE-14 | Session management (`SessionBloc`) | core | ✅ Complete | Track 06 |
| FE-15 | Auth repository (full endpoint surface) | core | ✅ Complete | Track 06 |
| FE-16 | Launch gate + navigation coordinators | client_app | ✅ Complete | Tracks 10–11 |
| FE-17 | Auth screens: entry / login / sign-up / verify | client_app | ✅ Complete | Stitch 006–009 |

### Not Started
- No remaining client Stitch screen exports. `business_app` and `stylist_app`
  remain skeletons.
- `business_app` and `stylist_app` features — both apps are skeletons.

### Backend routes for unbuilt features

Recorded so nobody re-derives them from the Stitch HTML or invents a route.

| Feature | Endpoint | Notes |
|---|---|---|
| Discovery Feed (016) | `GET /explore/branches` | **There is no `/client/discovery-feed`.** Requires `latitude`, `longitude`, `radius`, `universe`; accepts `per_page` (max 100), `catalog_item_ids[]`, `available_now`, `price_range{min,max}`, `rating_min`, `face_shape_compatible`. `clientId` is nullable — **guest-accessible**. Location permission is a prerequisite. |
| Discovery preferences | `GET`/`PATCH /client/discovery-preferences` | A separate preferences resource, **not** the feed |
| Stylist Profile (019) | `GET /explore/barbers`, `GET /explore/barbers/{barber}`, `GET /currencies` (public) | `{barber}` returns `{...BarberResource, services}` |
| Branch detail (017) | `GET /explore/branches/{branch}`, `GET /branches/{branch}/floor-plan`, `GET /branches/{branch}/chairs`, `GET /branches/{branch}/slots` | Slots: `date` + `service_ids[]` + (`chair_id` or `barber_id`); returns UTC `starts_at`/`ends_at` |
| Barber slots (Task 21) | `GET /barbers/{barber}/slots` | `date` + `service_ids[]`; at-home/freelancer bookings |
| Review & Rating (020) | `GET /branches/{branch}/reviews` | |

Paginated collections all return the same envelope
(`meta.pagination.{total,count,per_page,current_page,total_pages}`) and are
consumed through `ApiClient.getPaginated` → `PaginatedData<T>` → `Paged<T>`.
See `docs/state-management/pagination.md`.

## Branch times (BG-55, BG-56)

- `core` `BranchClock`: slot calls send the picked calendar date; slots, bookings and visits are shown on the branch clock (`utc_offset_minutes` from the backend, the device zone without it); book-again sends the picked time as `starts_at_local`. Mobile CI also runs `slot_date_time_zone_test.dart` with `TZ=Asia/Damascus`.

## Email change asks for the password (BG-62)

- `client_app` profile edit shows a current password field once the email differs by more than letter case (`ProfileEditCubit.changesEmail`) and `ProfileRepository.updateProfile` sends `current_password` with the new email. The form scrolls.
- The backend refuses an email change without it, so builds released before this can no longer change the email. Tests: `profile_edit_flow_test.dart`, `profile_repository_test.dart`.
