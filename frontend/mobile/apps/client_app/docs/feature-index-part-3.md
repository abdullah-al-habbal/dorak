---
codeanchors:
  - frontend/mobile/apps/client_app/lib/
---

Part 3 of 4 · [Feature Index — Dorak Client App (apps/client_app)](feature-index.md) · [Previous](feature-index-part-2.md) · [Next](feature-index-part-4.md)

### My Bookings — Stitch 017a (CL-10a)
- `lib/src/features/booking/booking.{bloc,event,state}.dart` — upcoming/past filter, refresh, load-more, cancel-then-reload over `Paged<BookingDto>`.
- `lib/src/features/booking/bookings.screen.dart` — filter + list + cancel confirm dialog; filter renders in the empty state.
- `lib/src/features/booking/widgets/booking_card.widget.dart` — locale-aware time, status badge, barber/chair/services, cancel affordance.
- `test/booking_bloc_test.dart` + `test/booking_flow_test.dart`; `FakeBookingRepository`, `testBooking`/`testBookingPage`, `fakeBookingBloc` in fakes.

### Branch Floor Plan & Booking Creation — Stitch 017b (CL-10b)
- `lib/src/features/booking/branch_detail.{bloc,event,state}.dart` — parallel detail + floor-plan load (plan failure tolerated), chair/services/date/slot selection, submit (`canSubmit` = chair + time ∈ offered slots), 409 conflict, retry. `_loadSlots` (Task 21) calls `BranchRepository.getBranchSlots` or `BookingRepository.getBarberSlots` once services (and a chair, or an at-home barber) are chosen, guarded by a synchronous request-id latch against stale responses.
- `lib/src/features/booking/branch_detail.screen.dart` — floor plan grid, barbers, services checklist, date picker + slot `ChoiceChip` list (free time picker removed), confirm, success `StatusView` → My Bookings.
- `lib/src/features/booking/widgets/floor_plan_grid.widget.dart` — legend + tappable available chairs.
- Nested `/discover/branch/:branchId` route; "View Details" on result cards; `BranchDetailBloc` built in `app.dart`.
- `test/branch_detail_bloc_test.dart` (incl. "cannot submit a time that was not offered by the slot list"); `FakeBranchRepository`/`FakeBookingRepository` slot methods, `testSlots`/`testSlotStart`, `testFloorPlan`, `testBranchDetail`, fake `createBooking` in fakes.

### Service History & Rebook — Stitch 018a (CL-11a)
- `lib/src/features/profile/history.{bloc,event,state}.dart` — `HistoryBloc` over `Paged<ServiceHistoryDto>` (start/refresh/load-more/retry) + rebook submit → `rebooked` flag, `HistoryRebookRequested` resets via `HistoryRebookAcknowledged`.
- `lib/src/features/profile/profile.screen.dart` — rebuilt into the 018 profile tab: client-name header card (fallback `profileMemberLabel`), Change Password entry kept, Service History section (per-entry rebook via Material date + time pickers, per-card `rebookingId` loader, 409 → `bookingConflictMessage`, success `StatusView` → My Bookings), RefreshIndicator + scroll load-more + retry + first-load/empty/error states.
- `test/history_bloc_test.dart` (8 cases) + `test/history_flow_test.dart`; `FakeHistoryRepository`, `testServiceHistory`/`testHistoryPage`, `fakeHistoryBloc`, `buildRouter` `history` param in fakes.

### Face Analysis & AI Style — Stitch 018b (CL-11b)
- `lib/src/features/profile/face_analysis.{bloc,event,state}.dart` — `FaceAnalysisBloc` over core `FaceProfileRepository` + `ServiceCatalogRepository`: start loads recommendations, scan uploads then polls the owned face profile's `analysis_status` with bounded backoff, terminal failure can be retried with a new scan, and `recommended_catalog_item_ids` are resolved into `CatalogItemDto`s by paging the catalog (per_page 100, cap 5 pages, catalog failure tolerated).
- `lib/src/features/profile/phone_verification.{bloc,event,state,screen}.dart` + `phone_verification_status.entity.dart` — `PhoneVerificationBloc` over core `ProfileRepository.requestPhoneOtp/verifyPhoneOtp`; route `AppRoutes.phoneVerify` (`/profile/phone-verify`, phone passed as `extra`). Profile edit (`ProfileEditCubit.phoneToVerify`) and profile completion (`ProfileCompletionState.phoneToVerify`) no longer PATCH the phone; the router pushes this screen, and a verified client is forwarded as `SessionAuthenticated`. Tests: `phone_verification_bloc_test.dart`, `phone_verification_screen_test.dart`, plus updated profile edit/completion tests.
- `lib/src/features/profile/avatar.{bloc,event,state}.dart` — `AvatarBloc` over core `ProfileRepository.uploadAvatar` → `avatarUrl`.
- `lib/src/features/profile/{photo_picker,image_picker_photo_picker}.provider.dart` — `PhotoPicker` seam + `ImagePickerPhotoPicker` (`image_picker` dep, hidden so tests never hit the platform).
- `lib/src/features/profile/profile.screen.dart` — avatar header (tap to upload, in-flight loader, fallback initial + camera badge), Face Analysis card (empty / pending / result with shape + confidence + photo / error-with-retry), Curated For You section (item name `[localeCode] ?? ['en']`, price range, style period).
- `test/face_analysis_bloc_test.dart` (9 cases) + `test/avatar_bloc_test.dart` (2) + `test/face_analysis_flow_test.dart` (4); `FakeFaceProfileRepository`, `FakeProfileRepository`, `FakeServiceCatalogRepository`, `FakePhotoPicker`, `testFaceAnalysis`/`testCatalogItem`/`testCatalogPage`, `fakeFaceAnalysisBloc`/`fakeAvatarBloc`, `buildRouter` params in fakes.

### Stylist Profile — Stitch 019 (CL-12)
- `lib/src/features/stylist/stylist_profile.{bloc,event,state}.dart` — `StylistProfileBloc` over core `ExploreRepository.getBarberDetail` + `CurrencyRepository.getCurrencies` (parallel detail + currencies load, currency failure tolerated, retry).
- `lib/src/features/stylist/stylist_profile.screen.dart` — avatar header, stats row mapping `rank`/`compatibility_score` onto `discoverRankBadge`/`discoverCompatibilityBadge` localizations, services list with price/currency/duration/at-home flag.
- Branch-detail barbers → tappable rows navigating to `/discover/barber/:barberId`.
- `test/stylist_profile_bloc_test.dart` + `test/stylist_profile_flow_test.dart`.

### Notification Inbox (Task 30)
- `lib/src/features/notifications/notifications.{bloc,event,state}.dart` — `NotificationsBloc` over `Paged<NotificationDto>`: start/refresh/load-more/retry, mark one read (`markingId`), mark all read (`isMarkingAll`); each mark reloads page 1 so server ordering (unread first) stays authoritative.
- `lib/src/features/notifications/notifications.screen.dart` + `widgets/notification_tile.widget.dart` — inbox at `/profile/notifications` (nested profile route via `_scope`), entered from the Profile tab's Notifications button; tap marks an unread row read; app-bar "Mark all as read" while anything is unread.
- Wiring: `AppServices.createNotifications`, `AppRouter.notifications` test seam, `buildRouter(notifications:)` + `FakeNotificationRepository` in `test/helpers/fakes.dart`.

### Notification Tap Routing (Task 31)
- `lib/src/core/navigation/notification_location.entity.dart` — maps a core `NotificationTarget` to a route: `review_request` → `/bookings/reviews/:bookingId`, `booking_update` → `/bookings`; invite/application/unknown → none.
- Inbox rows now navigate (read rows too) after marking an unread row read; `DorakApp` opens pushed notifications (`PushNotificationService.opened` + `takeInitialTarget()`), holding the location until the session is authenticated.
- Tests: `test/notification_location_test.dart`, `test/notifications_flow_test.dart`.
