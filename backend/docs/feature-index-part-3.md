---
codeanchors:
  - backend/modules/
---

Part 3 of 8 · [Feature Index — Dorak Backend](feature-index.md) · [Previous](feature-index-part-2.md) · [Next](feature-index-part-4.md)

### Review API
- `SubmitReviewAction` [POST /api/v1/client/bookings/{booking}/review] — validates ownership + completed status + one submission per client per booking (409). Subjects (Task 39): in-shop booking with a barber → branch review (`rating`) + barber review (`barber_rating` ?? `rating`, returned in `meta.barber_review`); barber-only/at-home → barber review; neither → 422 `no_subject`. Auth:client
- `GetBranchReviewsAction` [GET /api/v1/branches/{branch}/reviews] — paginated published reviews for a branch. No auth
- Branch storefront (Task 51): `branches.description/address` (translatable) and `tags`; `branch_opening_hours` + `branch_hours_overrides` via `BranchHours`; `PATCH branch/profile`, `PUT branch/opening-hours`, `PUT|DELETE branch/hours-overrides/{date}`; dashboard `PUT branches/{branch}/hours-overrides` sets a date range, optionally on some weekdays (FT-8); dashboard branch store/update accept the fields and `opening_hours`; explore detail exposes `opening_hours` and `today_hours`; bookings and slots respect branch hours (`booking_outside_schedule`).
- Brand feature flags (Task 50): Pennant `multi-branch` / `job-board` per brand (default off) via `BrandFeatures`; 403 `feature_not_enabled` for a second branch, job postings, and configuration writes on non-original branches after a downgrade; admin `GET/PATCH /api/v1/admin/brands/{brand}/features`; `BrandResource.features`.
- Brand creation defaults (Task 49): `POST /api/v1/brands` creates the brand and exactly one `pending` first branch in one transaction (`FirstBranchProvisioner`, also used by the admin panel); optional `universe` (default unisex) and `first_branch{name, latitude, longitude, email, password}`; unique `slug`; `branches_count` on brand payloads.
- Detail payloads (Task 48): branch detail lists the full bookable menu (branch + brand + seated barbers, `owner`-tagged); the floor plan gives each chair `barber.services` and `services_source` plus `branch_services`; barber detail adds `workplaces` (accepted affiliations). Shared `OfferedServiceModel::bookable()`/`offeredAtShop()`.
- Discovery preferences + interaction logs (Task 47): explore honours a signed-in client's `hidden_brand_ids`, `default_radius_km` (when `radius` is omitted) and `allows_unavailable_results`; `view` (detail), `search` (`q`/filters) and `favorite` interactions are logged by `ClientInteractionRecorder` through a queued job (`context`: screen, universe, query, filters, result_count). Guests are never logged.
- Composite ranking (Task 46): explore lists are scored over the whole candidate set (nearest 500) by `ExploreRanker` before pagination; `rank` is global; α is redistributed when vectors are missing; explicit `face_shape_compatible` filters while the client's own face analysis only boosts.
- Unified discovery (Task 45): `GET /api/v1/explore/search` returns `{type: branch|barber, distance, entity}` items — shops and freelancers merged nearest first with the shared filters; freelancers without coordinates appear only for `q` (distance null). `explore/branches` and `explore/barbers` are unchanged.
- Venue universe (Task 44): `branches.universe` / `barbers.universe` (`men`|`women`|`unisex`); explore `universe` is optional (explicit → client `preferred_universe` → none) and `men`/`women` also match `unisex`. New branches inherit the brand universe.
- Explore text search (Task 43): `q` (≤100) on `explore/branches` (branch, brand, service, catalog item and tag names) and `explore/barbers` (barber, service, catalog item and tag names), en+ar, case-insensitive substring via `ExploreTextSearch`; `tag_ids[]` filters by catalog tags.
- Rating aggregates (Task 42): `branches`/`barbers` store `rating_average` + `rating_count` (published/resolved reviews only), kept current by `ReviewRatingObserver` via `SubjectRatingRefresher`; `reviews:refresh-ratings` recomputes all. Exposed on `BranchResource`/`BarberResource` (explore lists and details); `rating_min` filters the stored column.
- Review disputes (Task 41): the reviewed party disputes — `POST /api/v1/branch/reviews/{review}/dispute` (branch subject) and `POST /api/v1/barber/reviews/{review}/dispute` (barber subject), `reason` 10–1000; 403 for anyone else. Admin `PATCH /api/v1/dashboard/admin/reviews/{review}/resolve` works any time while disputed; `reviews:release-expired-disputes` (hourly) re-publishes disputes older than 48 h. The client dispute route was removed. `rating_min` counts published reviews only.
- Client reviews (Task 40): `POST /api/v1/branch/bookings/{booking}/review` (auth:branch_api), `POST /api/v1/barber/bookings/{booking}/review` (auth:barber, branchless bookings only), `POST /api/v1/dashboard/bookings/{booking}/review` (manager/owner) — rate the client of a completed/no-show booking; one per `(booking, author_type, subject_type)`. Staff booking payloads (`StaffBookingResource`) include `client.reputation {average, count}`; client payloads never do.
- `GetBarberReviewsAction` [GET /api/v1/barbers/{barber}/reviews] — paginated published reviews for a barber (Task 39). No auth
- `ReviewResource` — id, subject_type, subject_id, rating, comment, status, disputed_at, resolved_at, author_name, created_at
- `SubmitReviewRequest` — validates rating (1-5) + comment (nullable, max 500)
- Routes: reviews.php

### Booking Cancel & Show
- `CancelBookingAction` [POST /api/v1/client/bookings/{booking}/cancel] — validates ownership + confirmed status → cancelled. Auth:client
- `ShowBookingAction` [GET /api/v1/bookings/{booking}] — validates ownership, returns booking resource. Auth:client

### Profile Read
- `GetProfileAction` [GET /api/v1/client/profile] — returns the authenticated client via `ClientProfileResource` (`id`, `name`, `email`, `phone`, `avatar`, `preferred_universe`, `email_verified_at`, `phone_verified_at`, `created_at`) — the same 8-key object login, register, social login and `PATCH /client/profile` return. Auth:client, verification scope (unverified clients allowed). Mobile uses it to restore the session client after a cold start.

### Profile Update
- `UpdateProfileAction` [PATCH /api/v1/client/profile] — nullable name and email; a `password` key is refused with 422 (BG-61, as on `PATCH barber/profile`; test `ProfileCredentialChangeTest`). Auth:client. Changing the email (more than letter case) requires `current_password` on both routes (422 `current_password`), and requests that carry an email are limited to 5 a minute per account (429) (BG-62, `Core\Support\ProfileEmailChange`). For a client it clears `email_verified_at` and queues a new verification code (`SendEmailVerificationCodeJob`); the client is then limited to the verification-only routes until `POST /client/email/verify` succeeds.
- `UpdateProfileRequest` — validates email (unique ignoring current); `password` must be absent

### Model Relations
- `BranchModel.reviews()` — MorphMany via subject_type='App\\\\Models\\\\Branch'
- `BranchModel.barbers()` — HasManyThrough via ChairModel
- `BarberModel.reviews()` — MorphMany
- `BarberModel.bookings()` — HasMany (for completed booking validation)
- `ClientModel.bookings()` — HasMany

### Brand API
- `ListBrandsAction` [GET /api/v1/brands] — lists all brands. No auth.
- `ShowBrandAction` [GET /api/v1/brands/{brand}] — single brand detail. No auth.
- Routes: brands.php

### BarberAffiliation API
- `CreateAffiliationAction` [POST /api/v1/barbers/{barber}/affiliate] — invite barber. Auth:barber
- `AcceptAffiliationAction` [POST /api/v1/affiliations/{affiliation}/accept] — accept invite. Auth:barber
- `RejectAffiliationAction` [POST /api/v1/affiliations/{affiliation}/reject] — reject invite. Auth:barber
- `ListBarberAffiliationsAction` [GET /api/v1/barbers/{barber}/affiliations] — list barber's affiliations. Auth:barber
- Routes: barber-affiliations.php
- Brand logo upload (FT-9): `POST dashboard/brands/logo` (owner, multipart `file`, JPEG/PNG/WebP up to 2 MB and 4096 px) stores on the `public` disk and returns `{url}` for `logo_url`; the dashboard add-brand form also sends `universe`.
- Catalog item attributes (FT-12): `PUT admin/catalog-items/{id}` clears `sku`, `price_range`, `maintenance_level`, `style_period_type`, `formality_level`, `default_duration_minutes` and `styling_details` when sent as `null`; `formality_level` is now returned; `price_range.max` must be at least `min`.
- Catalog item media (FT-12): `POST admin/catalog-items/{id}/media` (multipart `file`, JPEG/PNG/WebP, 2 MB, 4096 px, 10 per item) returns the medium with `image_url`; `DELETE admin/catalog-items/{id}/media/{media}` removes it and its file. Item `media` now carries `image_url`.
