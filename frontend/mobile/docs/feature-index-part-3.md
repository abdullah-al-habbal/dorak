---
codeanchors:
  - frontend/mobile/apps/client_app/lib/
---

Part 3 of 5 · [Feature Index — Dorak Mobile (Flutter Monorepo)](feature-index.md) · [Previous](feature-index-part-2.md) · [Next](feature-index-part-4.md)

### Password Recovery — Stitch 011–014
- `password_recovery.bloc.dart` (`.event.dart`/`.state.dart`) + `recovery_signal.entity.dart` — app-layer bloc over the core `AuthRepository`; carries email + code across the flow.
- `forgot_password.screen.dart` (011), `recovery_otp.screen.dart` (012), `create_new_password.screen.dart` (013), `password_reset_success.screen.dart` (014 — the first `StatusView` consumer).
- Content widgets: `forgot_password_content`, `recovery_otp_content`, `create_new_password_content`.
- **Three backend constraints** drive the design: no verify-reset-code endpoint (a bad code surfaces on 013, not 012), a 10-minute cache TTL, and `exists:clients,email` as an enumeration oracle the client deliberately does not surface. Resend calls `forgotPassword`, not `sendEmailVerification`. See `docs/authentication/password-recovery.md`.

### Navigation & Launch Gate
- `src/core/navigation/app.router.dart` — `AppRouter` (go_router): route table + redirects; success paths use `router.go('/home')`, which clears the stack.
- `src/core/navigation/app_routes.entity.dart` — `AppRoutes` path constants.
- `src/core/navigation/app_gate.entity.dart` — post-splash decision (`AppGate.resolve`, a pure function called from `AppRouter._leaveSplash`): session first, onboarding flag second. See `docs/flows/app-launch.md`.

### Home

### Discovery Feed — Stitch 016 (CL-09) ✅ Complete
- `DiscoveryBloc` + filter entity over `Paged<BranchDto>` + `FeedCache`; `DiscoveryScreen` with filter bar + result cards on the Discover tab; guest Book Now raises `RequireAuthentication`.

### My Bookings — Stitch 017a (CL-10) ✅ Complete
- `BookingRepository` + `BookingDto` family in core; `BookingBloc` + list screen + card + cancel confirm on the Bookings tab.

### Branch Floor Plan & Booking Creation — Stitch 017b (CL-10) ✅ Complete
- `BranchRepository.getFloorPlan` + `ExploreRepository.getBranchDetail` + `BookingRepository.createBooking` in core; `BranchDetailBloc` + `BranchDetailScreen` + `FloorPlanGrid` (chair/services/time selection, 409 conflict, success → My Bookings) on `/discover/branch/:branchId`.
- Slot availability (Task 21): `SlotDto` + `BranchRepository.getBranchSlots` (`GET /branches/{branch}/slots`) + `BookingRepository.getBarberSlots` (`GET /barbers/{barber}/slots`) in core. The branch detail replaces the free time picker with a date picker + a slot `ChoiceChip` list loaded once services (and a chair or at-home barber) are chosen; `canSubmit` requires the selected time to be one of the offered slots.

### Service History & Rebook — Stitch 018a (CL-11) ✅ Complete
- `HistoryRepository` + `ServiceHistoryDto` family (barber/branch/catalog-item/media) in core; `HistoryBloc` over `Paged<ServiceHistoryDto>` + rebook; `ProfileScreen` rebuilt as the 018 profile tab (name header card, Service History feed, rebook via Material pickers, 409 conflict, success → My Bookings).

### Face Analysis & AI Style — Stitch 018b (CL-11) ✅ Complete
- Core: `FaceProfileRepository` (`POST /client/face-profile` multipart upload, `GET /client/face-profile/recommendations`), `ProfileRepository` (`GET /client/profile` — used by `SessionBloc` restore, `PATCH /client/profile` (name/email only), `POST /client/phone/otp` + `POST /client/phone/verify` (phone verification, `ClientDto.phoneVerifiedAt`), `POST /client/avatar`, `PATCH /client/preferences/universe`), `ServiceCatalogRepository` (`GET /service-catalog/items` paged); DTOs `FacePhotoDto`/`FaceAnalysisResultDto`/`AvatarDto`/`UniversePreferenceDto`/`CatalogPriceRangeDto`/`CatalogItemDto` (+`ClientDto.preferredUniverse`), codegen. App: `FaceAnalysisBloc` (upload → pending → re-check; curated items resolved by paging the catalog) + `AvatarBloc` over the `PhotoPicker` seam; `ProfileScreen` avatar header, Face Analysis card (empty/pending/result/error) and Curated For You section.

### Stylist Profile — Stitch 019 (CL-12) ✅ Complete
- Core: `ExploreRepository.getBarberDetail` (`GET /explore/barbers/{barber}`, returns `{...BarberResource, services}`), `CurrencyRepository` (`GET /currencies` public); DTOs `BarberProfileDto`/`BarberServiceDto`/`CurrencyDto` (codegen). App: `StylistProfileBloc` (parallel detail + currencies, currency failure tolerated, retry), `StylistProfileScreen` (avatar header, stats row, services list with price/currency/duration/at-home), branch-detail barbers → tappable rows, route `/discover/barber/:barberId`.

### Review & Rating — Stitch 020 (CL-13) ✅ Complete
- Core: `ReviewEndpoints` (`POST /client/bookings/{booking}/review`, `GET /branches/{branch}/reviews`), `ReviewDto`/`SubmitReviewDto` (codegen), `ReviewRepository`/`DioReviewRepository` (`submitReview` → 201 `ReviewDto`; `getBranchReviews` → `Paged<ReviewDto>`). App: `ReviewSubmitBloc` (`ReviewSubmitStarted(bookingId, rating, comment)` → `isSubmitting`/`submitted`/`error`; `ReviewSubmitRetried` re-submits from stored rating), `ReviewSubmitScreen` (star row 1–5, comment field max 1000, submit `PrimaryButton` with `isLoading`/`isDisabled` guard, success `StatusView`), route `/reviews/:bookingId` under the Bookings shell branch, "Rate" button on `BookingCard` when `status == 'completed'`, `app.dart` DI + dispose.

### Notification Inbox — Task 30 ✅ Complete
- `NotificationRepository` + `NotificationDto` + `NotificationEndpoints` in core (`GET /notifications`, `PATCH /notifications/{id}/read`, `POST /notifications/read-all`, shared by every actor); client_app `NotificationsBloc` + inbox screen at `/profile/notifications`. stylist/business inboxes follow their shells (Tasks 82, 84); push-tap routing is Task 78.

### Empty Scaffolds (not implemented)
- `features/profile/` — directories only, no files.

---
