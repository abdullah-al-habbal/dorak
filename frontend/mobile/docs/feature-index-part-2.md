---
nodeid: mobile.feature-index.part-2
parentnode: mobile.feature-index
childnodes: []
codeanchors:
  - frontend/mobile/apps/client_app/lib/
---

Part 2 of 5 · [Feature Index — Dorak Mobile (Flutter Monorepo)](feature-index.md) · [Previous](feature-index.md) · [Next](feature-index-part-3.md)

### core
- `ConfigProvider` — `.env` via dotenv (`app_config.entity.dart`, `config.provider.dart`).
- `ApiClient` — Dio-based (`api.client.dart`).
- Interceptors: `auth.interceptor.dart`, `locale.interceptor.dart`, `logging.interceptor.dart`, `retry.interceptor.dart`.
- Contracts: `ApiResponse<T>` / `api_response.dto.dart`, `PaginatedData<T>`, `PaginationMeta`, exceptions (`ApiException`, `NetworkException`, `ValidationException`). Paging **state** is app-layer Bloc work — the legacy pagination notifiers were deleted (see `docs/state-management/pagination.md`).
- `endpoints/app.endpoints.dart`, `endpoints/auth.endpoints.dart` — domain-split endpoint declarations.
- `onboarding_config.repository.dart` — `OnboardingConfigRepository` + `OnboardingConfigDto` (GET /api/v1/app/onboarding-config).
- `auth.repository.dart` — `AuthRepository` + `DioAuthRepository`: login, register (sends `password_confirmation`), logout, refreshToken, sendEmailVerification, verifyEmail, forgotPassword, resetPassword, changePassword (`PATCH /client/password`). DTOs `AuthResponseDto`, `ClientDto`, `TokenResponseDto`.
- `change_password.{bloc,event,state}.dart` + `change_password.screen.dart` + `change_password_content.widget.dart` (Track 17) — authenticated password change entered from the Profile tab (`/profile/password`); 422 field errors in the banner, success `StatusView` with Done pop.
- **Storage** (`src/storage/`) — `TokenStorage` / `SecureTokenStorage` (flutter_secure_storage) and `AppPreferences` / `SharedAppPreferences` (shared_preferences, `dontShowOnboarding`). See `docs/core/storage.md`.
- **Session** (`src/session/`) — two independent pure `bloc`s over `AuthRepository` + `TokenStorage`: `AuthBloc` (`.bloc.dart`/`.event.dart`/`.state.dart`) for active auth actions (login/register/verify/resend), `SessionBloc` for session truth (restore — token refresh then `ProfileRepository.getProfile()` so `SessionState.client` is populated after a cold start —/logout/unauthorized/ack). Decoupled: the app layer forwards auth successes as `SessionAuthenticated`. Type-safe one-shot signals — `SessionSignal` on `SessionState`, `AuthSignal` on `AuthState` — consumed by the router's two stream listeners. See `docs/core/session.md`.
- `notification.repository.dart` — `NotificationRepository` + `DioNotificationRepository` (Task 30): paged inbox, mark one read, mark all read.
- `notifications/notification_target.entity.dart` — `NotificationTarget.fromPayload(type:, data:)` resolves inbox or FCM payloads to `review|booking|invite|application|unknown` (never throws); `PushNotificationService.opened` / `takeInitialTarget()` expose tapped pushes (Task 31). stylist_app and business_app map them through their own `notification_location.entity.dart` to the landing screen until Tasks 83/85 add invite/application screens. `PushNotificationService.initialize()` is best-effort (T1.6): without Firebase config it logs and returns, so the app runs without push and a later call retries; the registered `platform_type` is `ios` or `android` from the running platform.

---

## Client App (`apps/client_app`)

### Splash — Stitch 001
- `splash.screen.dart` — StatefulWidget, staged fade-in (logo, tagline, foreground), 2.5s auto-advance via `onFinished`, swipe/button to advance early.
- `splash_logo.widget.dart`, `splash_background.widget.dart` — gradient + PNG noise texture.
- **Asset fix:** `noise_overlay.svg` → generated `noise_overlay.png` (Flutter `Image.asset` cannot decode SVG).

### Onboarding Welcome — Stitch 002
- `welcome.screen.dart` + `welcome_content.widget.dart` — hero image, headline, sub-text, CTA, `ProgressDots(4, 0)`, Get Started.

### Onboarding Discovery — Stitch 003
- `discovery.screen.dart`, `discovery_content.widget.dart`, `discovery_card_deck.widget.dart` (staggered fade-slide cards), `discovery_card.entity.dart` (pure value object, hand-written — no JSON wire format), `onboarding_hero.widget.dart` (local asset + remote override).
- CTA `next`, `ProgressDots(4, 1)`.

### Onboarding Booking — Stitch 004
- `booking.screen.dart`, `booking_content.widget.dart`, `booking_visual.widget.dart` — 3 tilted glass cards (service / professional / date-time), staggered fade-slide-up, `ProgressDots(4, 2)`, Back + Next.

### Onboarding AI Showcase — Stitch 005
- `ai_showcase.screen.dart`, `ai_showcase_content.widget.dart`, `ai_showcase_visual.widget.dart` — avatar + face-shape chip, two recommendation cards with mini progress bars, decorative rings, privacy note, `ProgressDots(4, 3)`, Back + Get Started.

### Onboarding Infrastructure
- `onboarding_config.bloc.dart` (`.event.dart`/`.state.dart`) — `OnboardingConfigBloc`, loads `/app/onboarding-config` per locale, reloads on locale switch.
- `skip_bottom_sheet.sheet.dart` — shared 3-option skip sheet (Skip / Don't show again / Cancel); dismisses itself before either decision navigates.
- Flow wiring in `src/core/navigation/app.router.dart` (go_router). `Skip for now` leaves `dontShowOnboarding` untouched; `Don't show again` and completing the tour persist it. See `docs/flows/onboarding.md`.


### Authentication — Stitch 006–009
- `auth_entry.screen.dart` (006) — now reachable; its three callbacks are bound by `app.router.dart`.
- `login.screen.dart` + `login_content.widget.dart` (007).
- `sign_up.screen.dart` + `sign_up_content.widget.dart` (008) — 4 fields; the confirm field feeds `password_confirmation`.
- `verify_account.screen.dart` + `verify_account_content.widget.dart` + `otp_input_field.widget.dart` (009) — 6-digit code, 60 s resend cooldown, masked destination, non-blocking skip.
- Shared: `auth_text_field.widget.dart`, `auth_header.widget.dart`, `auth_error_banner.widget.dart`, `auth_validators.entity.dart`, `auth_error.entity.dart` (maps exceptions to local ARB strings — backend `message` values are untranslated keys).
