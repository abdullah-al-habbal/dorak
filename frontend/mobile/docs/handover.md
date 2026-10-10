# Handover — 2026-09-10

## TL;DR — quick orientation

- **What we did:** Stitch 019 (Barber/Stylist Profile) shipped — commit `7bbf998`, pushed to `main`. 277 tests green, 200 ARB keys, docs codified.
- **What we're doing:** Stitch 020 (Client Review & Rating, CL-13). Recon complete — backend contract verified. **No 020 code written yet.**
- **Most next action:** Fill `docs/stitch/exports/020_client_review_and_rating/plan.md`, then build the core review layer (`ReviewEndpoints`, `ReviewDto`, `ReviewRepository`).

---

## 1. Session objective

- **Stitch 019 (Stylist/Barber Profile, CL-12):** build barber profile screen. ✅ shipped + pushed.
- **Stitch 020 (Client Review & Rating):** recon complete; handover for next session to implement.

---

## 2. What we did — Stitch 019 DONE (commit `7bbf998`, main branch)

### Core layer

- `ExploreEndpoints.barberDetail` (already existed); new DTOs: `BarberProfileDto`, `BarberServiceDto`, `CurrencyDto` (codegen).
- `CurrencyEndpoints` + `CurrencyRepository`/`DioCurrencyRepository` (`GET /currencies`, public, no auth).
- `ExploreRepository.getBarberDetail` (`GET /explore/barbers/{barber}`, returns `{...BarberResource, services: [ServiceResource]}`).
- Core tests: `explore_repository_test` + `currency_repository_test` — **114 core tests** (was 110).

### ARB keys (200 per locale, EN+AR)

- 8 new: `stylistServicesTitle`, `stylistNoServicesMessage`, `serviceAtHomeLabel`, `serviceDurationLabel(int minutes)`, `servicePrice(String displayPrice, String currency)`, `stylistStatServicesLabel`, `stylistStatRankLabel`, `stylistStatCompatibilityLabel`.
- ICU placeholder keys now total 6 (was 4); `flutter gen-l10n` regenerated.

### App layer (`apps/client_app/lib/src/features/stylist/`)

- `StylistProfileBloc`: parallel barber detail + currencies; currency failure tolerated (flag); retry via stored `barberId`.
- `StylistProfileScreen`: avatar header (initial fallback), rank/compatibility chips via `discoverRankBadge`/`discoverCompatibilityBadge`, 3-column stats row, services list with price formatted by `NumberFormat.decimalPattern(localeCode)`, currency resolved from currencies map, at-home chip, duration.
- Branch-detail barbers: `ListTile` rows with chevron + `onBarberSelected` callback → `router.push(AppRoutes.barberDetail(barberId))`.
- Route: `/discover/barber/:barberId` under Discover shell.
- `app.dart`: `StylistProfileBloc` DI, closed in `dispose()`.
- Fakes: `FakeCurrencyRepository`, `testBarberProfile()`, `testCurrency()`, `fakeStylistProfileBloc()`, `buildRouter` params `stylistProfile` + `onBarberSelected`.

### App tests (145, was 137)

- `stylist_profile_bloc_test.dart` (5): parallel load, detail failure, currency failure tolerance, retry, retry-no-op.
- `stylist_profile_flow_test.dart` (3): loaded sections, error retry, empty services.

### Gate

- `dart run melos run verify` exit 0 — **277 tests** (114 core, 145 client_app, 14 design_system, 1×4). Taxonomy clean.
- Docs + AGENTS all codified. Export folder `019_stylist_profile` deleted. Commit `7bbf998` pushed.

---

## 3. What we are currently doing — Stitch 020, Client Review & Rating (CL-13): recon complete

Backend contract verified in `backend/modules/Review/`. No code written yet.

### Backend contract

**Submit review**

`POST /client/bookings/{booking}/review` (auth:client)

```
{ rating: int 1-5 required, comment: string? max: 1000 }
```

- Subject resolved server-side: `booking.chair.branch_id` → subject = branch. No branch/barber ID in the payload.
- Guards:
  - `not_own_booking` → 403 `REVIEW_VALIDATION_FAILED`
  - `bookingNotCompleted` (status !== `BookingStatus::Completed`) → 422
  - `alreadyReviewed` (booking.review exists) → 409
  - `noSubject` (chair or branch null) → 422
- Success 201: `{id, rating, comment, author_name?, created_at}`.
- All error messages are untranslated backend keys → map locally via `AuthError`-style mapping (same as 409 `bookingConflictMessage` pattern).

**Branch reviews listing**

`GET /branches/{branch}/reviews` (public, paginated, `per_page` 1..100 default 20)

- Response (`ReviewResource`): `{id, rating, comment, author_name?, created_at}`.
- Ordered `created_at` desc; `author_name` present (author loaded).

**Booking statuses:** `confirmed`, `canceled`, `completed`.

### Design → Real mapping (like 019)

| Design shows | Backend supports | Real |
|---|---|---|
| 3 separate ratings (overall, stylist, shop) | Single `rating` 1-5 | Single overall rating only |
| Tags (Skill, Professionalism, Punctuality, Cleanliness, Atmosphere) | No tag field | Drop — tags absent |
| Photo upload | No photo/image field in request or migration | Drop — no backend support |
| Written review comment | `comment: string? max: 1000` | Keep as-is |

### Entry point

- From **My Bookings** tab (017a): completed bookings get a "Rate" action/button.
- `POST /client/bookings/{booking}/review` takes `{booking}` from URL param — booking context determines the subject (branch). No branch/barber ID needed in the payload.
- Bookings list filter: `upcoming` / `past`. **Open question:** does the `past` filter surface `completed` status bookings? (Past bookings include `time_slot` in the past; `completed` status is set separately by the barber/admin. A booking could be past + confirmed, or past + completed.) `BookingDto.status` is surfaced in the client (String), but the client UI currently has no per-status affordance.
- After submission: navigate to the reviewed booking (or back to bookings list) with a success `StatusView`.

---

## 4. Needed core layer

- `ReviewEndpoints`: `submitReview(String bookingId)` → `/client/bookings/$bookingId/review`, `branchReviews(String branchId)` → `/branches/$branchId/reviews`.
- `ReviewDto`: `{id, rating, comment, authorName?, createdAt}`.
- `SubmitReviewDto`: request body `{rating, comment?}`.
- `ReviewRepository` / `DioReviewRepository`: `submitReview(String bookingId, {required int rating, String? comment})` → 201 `ReviewDto`; `getBranchReviews(String branchId, {int page})` → `Paged<ReviewDto>`.
- Core tests: `review_repository_test.dart` (submit parse, branch-list parse, 403/409/422 error mapping).

---

## 5. App layer plan

- `features/review/review_submit.{bloc,event,state}.dart` + `review_submit.screen.dart`:
  - Bloc: `ReviewSubmitStarted(bookingId)` → submits; tracks `isSubmitting`, `submitted` (success flag), `error`.
  - Screen: Scaffold with star-rating row (1-5, 5 tappable stars, `Icon(Icons.star)` / `Icons.star_border`), comment `TextField` (max 1000 chars, 4 rows), submit `PrimaryButton` with `isLoading`/`isDisabled` guard. Success → `StatusView`("Review submitted") + pop or "Back to Bookings".
- Branch reviews listing (optional stretch): add a reviews section to `BranchDetailScreen` using `getBranchReviews` — a list of ReviewCards (stars + comment + author name + date). Not critical for 020 core; can be deferred if scope management requires.
- Entry: on `BookingCard`, when `status == 'completed'`, add a "Rate" button → `router.push('/reviews/$bookingId')`.
- Route: `/reviews/:bookingId` under shell, bloc DI in `app.dart`.

---

## 6. New ARB keys (estimated ~10)

| Key | EN value |
|---|---|
| `reviewTitle` | Rate Your Experience |
| `reviewStylistPrompt` | How was your session? |
| `reviewCommentHint` | Share more details... (optional) |
| `reviewSubmitButton` | Submit Review |
| `reviewSubmitSuccess` | Review submitted |
| `reviewAlreadyReviewed` | You already reviewed this booking |
| `reviewBookingNotCompleted` | This booking hasn't been completed yet |
| `reviewErrorGeneric` | Could not submit your review |
| `reviewStarLabel(int stars)` | {stars} out of 5 stars |
| `reviewCommentsSection` | Reviews (for branch detail listing) |

All keys must be added to **both** `app_en.arb` and `app_ar.arb` (Arabic real translation), then `melos run generate`.

---

## 7. Files to create/modify

- `packages/core/lib/src/network/endpoints/review.endpoints.dart` (new)
- `packages/core/lib/src/network/dto/review.dto.dart` + `.g.dart` (new)
- `packages/core/lib/src/network/dto/submit_review.dto.dart` + `.g.dart` (new)
- `packages/core/lib/src/network/repositories/review.repository.dart` (new)
- `packages/core/lib/src/network/network.barrel.dart` (add exports)
- `packages/core/test/review_repository_test.dart` (new)
- `apps/client_app/lib/src/features/review/review_submit.{bloc,event,state}.dart` (new)
- `apps/client_app/lib/src/features/review/review_submit.screen.dart` (new)
- `apps/client_app/lib/src/core/navigation/app_routes.entity.dart` (add `reviewSegment` + `reviewDetail(String)`)
- `apps/client_app/lib/src/core/navigation/app.router.dart` (add `ReviewSubmitBloc` param + route)
- `apps/client_app/lib/app.dart` (DI: `DioReviewRepository`, `ReviewSubmitBloc`, close)
- `apps/client_app/lib/src/features/booking/booking.card.widget.dart` (add "Rate" action for `status == 'completed'`)
- `apps/client_app/test/helpers/fakes.dart` (add `FakeReviewRepository`, `testReview()`, `fakeReviewSubmitBloc()`, `reviewSubmit` param on `buildRouter`)
- `apps/client_app/test/review_submit_bloc_test.dart` (new)
- `apps/client_app/test/review_submit_flow_test.dart` (new)
- `packages/localization/l10n/app_en.arb` + `app_ar.arb` (~10 new keys)
- `docs/stitch/exports/020_client_review_and_rating/` — delete after build

---

## 8. Open decision

**Branch reviews listing:** include in 020 scope or defer? The `GET /branches/{branch}/reviews` endpoint exists and would add a reviews section to `BranchDetailScreen` (below barbers). It adds ~3-4 test cases and one new screen section. The design doesn't show this — it's a client-side "rate" flow. Recommended: include a simple reviews list on branch detail as part of 020 since the endpoint is public and already verified — it completes the review loop end-to-end and makes the branch detail richer. But this is a scope decision.

---

## 9. Next steps (in order)

1. Read this handover + `docs/index.md` (§6 current execution point) + root `AGENTS.md`.
2. Create core: `ReviewEndpoints`, `ReviewDto`, `SubmitReviewDto`, `ReviewRepository`/`DioReviewRepository` → `melos run build`.
3. Core tests: `review_repository_test.dart` (submit + branch list) → core 114→~117.
4. ARB keys EN+AR (10) + `melos run generate` → 200→~210 keys.
5. App: `features/review/` bloc + screen, route `/reviews/:bookingId`, booking card "Rate" action for completed status, `app.dart` wiring, fakes.
6. App tests: bloc + flow → client_app 145→~153.
7. Gate (`dart run melos run verify` exit 0).
8. Codify docs/AGENTS (277→~284+ tests, ~210 ARB keys, 020 built).
9. Delete `020_client_review_and_rating` export folder.
10. Commit: `feat: Stitch 020 Client Review & Rating (CL-13)` + push.

---

## 10. Most next action

Open `docs/stitch/exports/020_client_review_and_rating/plan.md` (currently empty), fill it with this plan, then start building core layer — `ReviewEndpoints` + `ReviewDto` + `ReviewRepository`.

Files to read first: `frontend/mobile/AGENTS.md` (full conventions), then `docs/index.md` §6. Key file to modify: `packages/core/lib/src/network/endpoints/booking.endpoints.dart` (existing review endpoint constant missing — needs adding), and `packages/core/lib/src/network/network.barrel.dart` (exports).

---

## 11. Conventions (unchanged)

- One top-level public class per file. No comments in `lib/`. App imports only (`core.dart`).
- Bloc never navigates. Routing via `go_router` + `AppRoutes` constants.
- ARB: EN + AR parity. camelCase, feature-prefixed keys. ICU placeholders for functions.
- DTOs: `json_serializable`, `fieldRename: FieldRename.snake`. Generated code committed.
- Test fakes: inject via constructor, never touch real network/plugins. Bloc built inside `testWidgets` body, never in `setUp`.
- `dart run melos run verify` must exit 0 before calling work done.
- Re-baseline counts in docs/AGENTS after every green gate.

---

## 12. Gate baseline (current, pre-020)

- **277 tests** — core 114, client_app 145, design_system 14, localization 1, business_app 1, stylist_app 1, feature_floor_plan 1.
- **200 ARB keys** (EN+AR identical).
- All 7 packages analyze clean. Taxonomy passes.