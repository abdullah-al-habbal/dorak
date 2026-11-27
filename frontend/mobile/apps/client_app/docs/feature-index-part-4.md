---
codeanchors:
  - frontend/mobile/apps/client_app/lib/
---

Part 4 of 4 · [Feature Index — Dorak Client App (apps/client_app)](feature-index.md) · [Previous](feature-index-part-3.md)

### Empty Scaffolds (no files yet)
- `lib/src/features/profile/` (password entry button only)
- `lib/src/core/{di,theme}/`

### Review & Rating — Stitch 020 (CL-13)

- `lib/src/features/review/review_submit.event.dart` — `ReviewSubmitStarted(bookingId, {rating, comment})`, `ReviewSubmitRetried`.
- `lib/src/features/review/review_submit.state.dart` — `bookingId`, `rating`, `comment`, `isSubmitting`, `submitted`, `error`.
- `lib/src/features/review/review_submit.bloc.dart` — `ReviewSubmitBloc` over `ReviewRepository.submitReview`; retry re-submits from stored rating.
- `lib/src/features/review/review_submit.screen.dart` — `ReviewSubmitScreen`: star rating row (1–5), comment field (max 1000, 4 rows), submit `PrimaryButton` (`isLoading`/`isDisabled`), success `StatusView` ("Review submitted" → View Bookings).
- `lib/src/core/navigation/app_routes.entity.dart` — `reviewSegment`, `reviewDetail(bookingId)`.
- `lib/src/core/navigation/app.router.dart` — `/reviews/:bookingId` route nested under the Bookings shell branch.
- `lib/src/features/booking/widgets/booking_card.widget.dart` — `rateLabel`/`onRate` params; "Rate" button shown when `status == 'completed'`.
- `lib/src/features/booking/bookings.screen.dart` — `onRate` callback → `router.push(reviewDetail(bookingId))`.
- `lib/app.dart` — `DioReviewRepository` + `ReviewSubmitBloc` DI, closed in `dispose()`.
- `test/helpers/fakes.dart` — `FakeReviewRepository`, `testReview()`, `fakeReviewSubmitBloc()`, `reviewSubmit` param on `buildRouter`.

### Assets
- `assets/images/noise_overlay.png` — generated noise texture (replaces SVG).
- `assets/images/onboarding_hero.jpg` — hero image, local-first.

---

## Client Feature Registry

| # | Feature | Status | Source |
|---|---------|--------|--------|
| CL-01 | Splash | ✅ Complete | Stitch 001 |
| CL-02 | Onboarding Welcome | ✅ Complete | Stitch 002 |
| CL-03 | Onboarding Discovery | ✅ Complete | Stitch 003 |
| CL-04 | Onboarding Booking | ✅ Complete | Stitch 004 |
| CL-05 | Onboarding AI Showcase | ✅ Complete | Stitch 005 |
| CL-06 | Onboarding Infrastructure (config, skip sheet, flow) | ✅ Complete | — |
| CL-07 | Home placeholder | ✅ Complete | — |
| CL-08 | Auth flow — entry / login / register / verify | ✅ Complete | Stitch 006–009 |
| CL-08c | Locale switcher on all pre-Home screens (onboarding header + auth entry/login/register/verify via shared `LocaleSwitcher`) | ✅ Complete | — |
| CL-08b | Password recovery — forgot / code / new password / success | ✅ Complete | Stitch 011–014 |
| CL-14 | Launch gate + go_router route table | ✅ Complete | Tracks 10–11 |
| CL-09 | Discovery Feed | ✅ Complete | Stitch 016 |
| CL-17 | Authenticated password change | ✅ Complete | Track 17 |
| CL-10a | My Bookings (list/filter/cancel) | ✅ Complete | Stitch 017a |
| CL-10b | Branch Floor Plan & Booking creation | ✅ Complete | Stitch 017b |
| CL-11 | Personalised Profile & AI Style — 018a Service History + Rebook; 018b Face Analysis + AI recs | ✅ Complete | Stitch 018 |
| CL-12 | Stylist Profile | ✅ Complete | Stitch 019 |
| CL-13 | Review & Rating | ✅ Complete | Stitch 020 |
