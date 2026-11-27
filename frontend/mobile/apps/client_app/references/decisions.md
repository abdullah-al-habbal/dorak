---
codeanchors:
  - frontend/mobile/apps/client_app/lib/
---

# Client app decisions that are not in the code

Referenced from the [app guide](../AGENTS.md).

| Code | Why |
|---|---|
| `ApiClient(tokenProvider: _tokenStorage.read)` | Reads storage, not `SessionBloc` — the bloc depends on the client, so the reverse would be a cycle. Also the only thing that installs `AuthInterceptor`. |
| `unawaited(_session.ready)` in `initState` | Restore overlaps the 2500 ms splash, so the gate adds no wait. |
| `AppGate` awaits `session.ready`, not `restore()` | `ready` memoises; calling `restore()` would fire a second pass. |
| `SkipBottomSheet` pops itself before invoking callbacks | Otherwise navigation fires with the modal route still on top. Pops with `context.pop()`. |
| `_dismissForever` writes in `try`, navigates in `finally` | A failed preference write must not strand the user on the tour. |
| `onSkipForNow: () => router.go(AppRoutes.home)` with no flag write | Deliberate: `Skip for now` ≠ `Don't show again`. |
| Register never calls `sendEmailVerification()` | The backend owns the OTP lifecycle — registration dispatches `SendEmailVerificationCodeJob` (after commit, async), so the client has no post-register call to guard. Resend on the verify screen is the only client-side retry. |
| `onForgotPassword` opens 011 | The parameter is still nullable so the link *can* be hidden. The unused `RecoveryRestarted` event was removed in Task 81; each `RecoveryCodeRequested` overwrites the carried email and code. |
| "Email", not the design's "Email or Phone" | The backend accepts email only — the design label would guarantee a 422. |
| `AuthEntryBackground` reused by login and sign-up | Deliberately not duplicated into a second blobs widget. |
| `AuthTextField` / `OtpInputField` are app-local | Promotion to `design_system` is Track 15. |
| `Wrap` not `Row` in the auth footers | Prompt + link overflow a narrow screen once Arabic or a large text scale widens them. |
| `SizedBox(height: 24)` around the verify error banner | Reserved height stops the button jumping. |
| `OtpInputField` drives focus from `onChanged`, `onKeyEvent` only as a bonus | Soft-keyboard deletions arrive on the text-input channel, not the key channel. |
| `AuthHeader`'s trailing `SizedBox(width: 64)` + `FittedBox` | Balances the leading `IconButton` so the brand stays centred; the right slot hosts the shared `LocaleSwitcher` (scale-down) and still mirrors the back button's 64 px width. |
| `AuthShell` wraps every auth screen | One outer geometry — `SafeArea → LayoutBuilder → SingleChildScrollView → maxWidth 480, margin 20` — shared by Auth Entry / Login / Register / Verify (and future Forgot-Password screens). Two modes: **composed** (default; header is part of the centered scrollable group — used by Auth Entry, which has no transactional needs) and **pinned header** (`pinnedHeader: true`; header sits above an `Expanded` content area — used by Login/Register/Verify so back button + locale switcher never scroll away under viewport pressure). Two-mode **height policy**: when the available height (from `LayoutBuilder`, not MediaQuery) is ≥ 840 the content centers vertically (`ConstrainedBox(minHeight) + Center`); below it the content top-anchors and scrolls naturally — no dead bands, keyboard-open lands in the anchored mode, CTA stays reachable. 840 is derived, not arbitrary: the tallest composition (Register, ≈680 px natural height) + 2×24 margins + ≥56 px intentional centering band each side. Result: centering only on tablet-portrait/desktop/tall windows; every phone portrait is top-anchored. Update the constant in one place if the composition grows. |
| `dio` as a dev dependency | `NetworkException` carries a `DioExceptionType`; test fakes need it. |
| `geolocator` as a dev dependency | `LocationProvider` returns a geolocator `Position`; `FakeLocationProvider` + `testPosition` need the type. Same precedent as `dio`. |
| `DiscoveryBloc` reads `position.latitude/longitude` via inference | Naming the `Position` type would import `geolocator` into app `lib/` — inferred `final position = await …` keeps the dependency in core. |
| Bookings filter renders in the empty state too | The filter was unreachable on an empty list (it lived in the feed header) — `_BookingsFilter` is shared between the empty `Column` and the feed. |
| Booking times use `intl` directly | Locale-aware `DateFormat.yMMMd(locale).add_Hm()`; `intl: ^0.20.0` pinned same as `localization`. |
| Cancel is a Material `AlertDialog`, not a sheet | No dialog exists in `design_system` (Track 15); a two-action confirm dialog is the responsible minimum for a destructive action. |
| Segmented universe control, not chips | `design_system` has no chip (Track 15) — Material `SegmentedButton` covers men/women without inventing one. |
| Branch storefront line under the header (Task 51) | `BranchStorefront` shows description, address and `today_hours` only when present; a branch without configured hours shows no hours line rather than a guessed "open". |
| Branch detail loads detail + floor plan in parallel, plan failure tolerated | A dead floor-plan endpoint must not blank the whole branch page — `planFailed` renders an inline retry `StatusBanner` under the loaded detail. |
| Booking submit requires chair + time; services optional | `canSubmit = chair && time && !isSubmitting`; `service_ids` is nullable on the wire and sent as `null` when empty (backend `required_without`/lists are optional). |
| Barber silently resolved from the selected chair | The plan's `ChairResource` carries `barber`; the user picks a chair, not a barber — the submit payload fills `barber_id` from the chair to keep the booking consistent. |
| 409 mapping lives in the screen, not the bloc | The bloc stores the raw `ApiException` in `submitError`; `_submitMessage` maps `statusCode == 409` → `bookingConflictMessage`, 422 `errors` → field copy, `NetworkException` → `errorNetwork`. Keeps a pure core exception in state. |
| Time picked with Material date + time pickers | Design has no custom time selector (Track 15); `showDatePicker` + `showTimePicker` give localised pickers for free. Slot stored as local `DateTime`, wire-formatted to UTC by core. |
| `buildRouter` takes `bookings` + `branchDetail` fakes | Matched-param seams keep constructors honest; defaults per feature keep unrelated router tests untouched. |
| History rebook success renders a `StatusView`, navigation via `onViewBookings` callback | Bloc never navigates; the screen surface + callback (`router.go(AppRoutes.bookings)`) keeps routing in the router wiring. |
| Rebook error mapping lives in the screen, not the bloc | Same rule as booking submit: bloc stores the raw `ApiException` in `rebookError`; the screen maps 409 → `bookingConflictMessage`, `NetworkException` → `errorNetwork`, else `errorGeneric`. |
| Notification mark-read reloads page 1 instead of patching the item | `Paged.succeeded` appends when the last trigger was `more`, and the backend orders unread first — refetching keeps order and unread state server-authoritative (same idiom as booking cancel). |
| Notification inbox lives under `/profile/notifications` | Not a fifth shell tab; entry is a Profile `SecondaryButton`. Tapping a row marks it read and opens the review (`review_request`) or bookings list (`booking_update`) via `NotificationLocation` (Task 31); booking-details deep links still need the booking and stay in Task 78. |
| History item name resolved from the translations map | `catalog_item.name[localeCode] ?? ['en'] ?? ''` — object keys are locale codes, value is the localized display name. |
| Rebook slot formatted like `createBooking` | UTC `yyyy-MM-dd HH:mm:ss`, shared convention with 017b booking creation. |
| Rebook pickers are Material date + time pickers | Same precedent as 017b — no custom time selector (Track 15). |
| `image_picker` is a runtime dep behind a `PhotoPicker` seam | The scan + avatar uploads live behind the app-local abstract `PhotoPicker`; `ImagePickerPhotoPicker` is the only consumer of the platform plugin, so widget tests inject `FakePhotoPicker` and never hit the gallery. |
| Avatar camera badge uploads by tapping the avatar (or badge) | The whole `InkWell` circle is the target — a 56 px hit area instead of a 24 px one. While uploading the badge swaps to `AppLoader.inline()`. |
| Avatar fallback initial + `Image.network` `errorBuilder` | A stored `avatar_url` can 400 outside the test binder; the initial renders instead of a broken image. |
| Pending analysis is `awaitingAnalysis`, not a separate screen | The backend dispatches `AnalyzeFacePhotoJob` after upload and exposes profile status through `GET /client/face-profile/{profile}`. The bloc polls with bounded backoff; terminal failure can be retried with a new scan. |
| `recommended_catalog_item_ids` resolved by paging the catalog | `/service-catalog/items` has no ids filter and no face-shape filter — the bloc pages `per_page: 100` up to 5 pages; a catalog failure is tolerated (`curated` stays empty) so the analysis card still renders. |
| Curated card price + style period share one `Text` (`join('\n')`) | Same idiom as the history meta lines; keeps a single tappable surface and no new card layout. |
| Face shape labels come from `faceShape*` ARB keys via a private `_shapeLabel` switch | Seven enum values (`oval|round|square|heart|diamond|oblong|triangle`) map to localized strings; unknown values fall through as the raw string. |
| `FacePhotoDto.isPrimary` defaults false | The `face_profile` embed inside a recommendation omits `is_primary` — a required wire field would 400 the parse. Confirm left default, matching the upload default. |
| Price formatted client-side with `NumberFormat.decimalPattern(localeCode)` | ARB `servicePrice` takes the pre-formatted string + currency code; the bloc formats the number, the screen passes it to the localization |
| Currencies fetched via public `GET /currencies` | Mapped by id→code in the screen; failure tolerated — prices render without a currency suffix |
| `buildRouter` fakes `stylistProfile` + `onBarberSelected` | Defaulted per feature so unrelated router tests stay untouched |
| `RecoveryCodeEntered` raises a signal instead of the screen pushing directly | `bloc.add` goes through the event queue, so a direct push could build 013 before the code reached state. Routing on the emitted state makes the ordering correct by construction |
| Recovery resend calls `forgotPassword`, not `sendEmailVerification` | Different endpoints, different throttles (`email/verify/send` is `throttle:3,1`). Conflating them sends the wrong kind of code |
| `PasswordRecoveryBloc` lives in `client_app`, not `core` | Session truth is shared infrastructure (ADR 0001); recovery is a client feature flow. Same shape as `OnboardingConfigBloc` — an app bloc over a core repository |
| 014 exits with `go`, not `push` | The code has been consumed; a completed reset must not be back-navigable |
| The onboarding hero keeps its asset fallback on a config failure | The bundled asset is always available, so an error view would be strictly worse. The failure is a layered retry, never a replacement |
| A validation error from forgot-password counts as "code sent" | The screen must not reveal which addresses have accounts. Only transport failures block. |
| Auth and onboarding success use `router.go(AppRoutes.home)` | `go` clears the stack, so those screens can't be reached with back. |
