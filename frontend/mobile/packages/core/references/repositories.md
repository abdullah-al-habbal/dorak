---
nodeid: mobile.packages.core.references.repositories
parentnode: mobile.packages.core
childnodes: []
codeanchors:
  - frontend/mobile/packages/core/lib/
---

Referenced from [`../AGENTS.md`](../AGENTS.md).

## 4. Repositories

`AuthRepository` / `DioAuthRepository` — `login`, `register`, `logout`,
`refreshToken`, `sendEmailVerification`, `verifyEmail`, `forgotPassword`,
`resetPassword`, `changePassword` (`PATCH /client/password`).

`OnboardingConfigRepository` / `DioOnboardingConfigRepository` —
`GET /app/onboarding-config`, cached per locale in memory.

`ExploreRepository` / `DioExploreRepository` (one file,
`explore.repository.dart`) — `getBranches` (parsed page) and
`getBranchesPayload` (parsed + raw for cache writes) over
`GET /explore/branches`, with `page` for pagination and the full filter set
(latitude/longitude/radius/universe/per_page/catalog_item_ids/available_now/
price_range/rating_min/face_shape_compatible).

`BookingRepository` / `DioBookingRepository` (one file,
`booking.repository.dart`) — `getBookings` (status/page/per_page filter over
`GET /bookings`, parsed via `getPaginated`) and `cancelBooking` (`POST
/client/bookings/{booking}/cancel`, `{booking}` substituted, `_discardBody`).
Wire models: `BookingDto` + nested `BookingChairDto`/`BookingBarberDto`/
`BookingServiceDto` (codegen, tolerant nulls for unloaded relations).

`HistoryRepository` / `DioHistoryRepository` (one file,
`history.repository.dart`) — `GET /client/history` (auth: client) and
`POST /client/history/{history}/rebook`. Implemented (018a):
`getHistory` (paged list, `per_page` default 15, eager-loaded
barber/branch/catalogItem/media) and `rebookFromHistory` (slot
`yyyy-MM-dd HH:mm:ss` UTC, 201 → parsed `BookingDto`). Wire models:
`ServiceHistoryDto` + nested `HistoryBarberDto`/`HistoryBranchDto`/
`HistoryCatalogItemDto` (`name` is a locale→text translations map; resolve
`[localeCode] ?? ['en'] ?? ''`)/`HistoryMediaDto`.

`FaceProfileRepository` / `DioFaceProfileRepository` — 018b:
`uploadFacePhoto(filePath, {isPrimary = false})` posts multipart `photo` +
`is_primary` to `POST /client/face-profile`; `getRecommendations()` reads
`GET /client/face-profile/recommendations` (latest-`computed_at` first,
nullable `recommended_catalog_item_ids`, nested `face_profile`). NB: upload
queues analysis server-side; `getProfile(id)` reads the profile's
`analysis_status` while the bounded client poll waits for completion.

`ProfileRepository` / `DioProfileRepository` — Task 34: `requestPhoneOtp(phone)` / `verifyPhoneOtp(code)` (phone is no longer an `updateProfile` argument); 018b: `updateProfile`
(`PATCH /client/profile`, null-aware map entries `'name': ?name`), 
`uploadAvatar(filePath)` (multipart `avatar`, ≤ 2048 kB → `{avatar_url}`),
`updatePreferredUniverse` (`PATCH /client/preferences/universe`).

`ServiceCatalogRepository` / `DioServiceCatalogRepository` — 018b:
`getCatalogItems({page, perPage})` over `GET /service-catalog/items`
(shared/public, paged; no ids/face-shape filter — resolve `CatalogItemDto`s
by paging).

`AuthEndpoints` declares 10 routes; the repository covers 8.
`changePassword` and `socialLogin(provider)` have constants but **no method**.

