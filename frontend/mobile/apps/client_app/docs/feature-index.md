---
nodeid: mobile.apps.client-app.feature-index
parentnode: mobile.apps.client-app
childnodes:
  - mobile.apps.client-app.feature-index.part-2
  - mobile.apps.client-app.feature-index.part-3
  - mobile.apps.client-app.feature-index.part-4
codeanchors:
  - frontend/mobile/apps/client_app/lib/
---

# Feature Index — Dorak Client App (`apps/client_app`)

> **Append entry after adding each feature.** Chronological map of features built in the client (end-user) app. Monorepo-wide index: [`docs/feature-index.md`](../../../docs/feature-index.md).

---

### Splash — Stitch 001
- `lib/src/features/splash/splash.screen.dart` — staged fade-in, auto-advance after 2.5s via the injected `onFinished`, which runs `AppRouter._leaveSplash` → `AppGate.resolve`. No early-advance gesture despite earlier notes here.
- `lib/src/features/splash/widgets/splash_logo.widget.dart` — animated logo.
- `lib/src/features/splash/widgets/splash_background.widget.dart` — gradient + `noise_overlay.png` (converted from SVG — `Image.asset` cannot decode SVG).

### Onboarding Welcome — Stitch 002
- `lib/src/features/onboarding/welcome.screen.dart` — StatefulWidget, staggered fade, `ProgressDots(4, 0)`, Get Started CTA, skip sheet.
- `lib/src/features/onboarding/widgets/welcome_content.widget.dart` — hero image, headline, sub-text, CTA row.

### Onboarding Discovery — Stitch 003
- `lib/src/features/onboarding/discovery.screen.dart` — `ProgressDots(4, 1)`, Next CTA.
- `lib/src/features/onboarding/widgets/discovery_content.widget.dart` — headline/subtitle + card deck.
- `lib/src/features/onboarding/widgets/discovery_card_deck.widget.dart` — staggered fade-slide-up cards (`Interval` per index).
- `lib/src/features/onboarding/discovery_card.entity.dart` — pure value object (icon, title, description keys); no wire format, hand-written.
- `lib/src/features/onboarding/widgets/onboarding_hero.widget.dart` — local asset `onboarding_hero.jpg` with remote URL override + `errorBuilder`.

### Onboarding Booking — Stitch 004
- `lib/src/features/onboarding/booking.screen.dart` — `ProgressDots(4, 2)`, Back + Next, skip sheet.
- `lib/src/features/onboarding/widgets/booking_content.widget.dart`
- `lib/src/features/onboarding/widgets/booking_visual.widget.dart` — 3 tilted glass cards (service / professional / date-time), staggered fade-slide-up, Material icons in tinted containers (offline-safe, no network images).

### Onboarding AI Showcase — Stitch 005
- `lib/src/features/onboarding/ai_showcase.screen.dart` — `ProgressDots(4, 3)`, Back + Get Started.
- `lib/src/features/onboarding/widgets/ai_showcase_content.widget.dart` — avatar + face-shape chip, 2 recommendation cards with mini progress bars (`FractionallySizedBox`), decorative rings, privacy note.
- `lib/src/features/onboarding/widgets/ai_showcase_visual.widget.dart`

### Onboarding Infrastructure
- `lib/src/features/onboarding/onboarding_config.bloc.dart` (with `.event.dart` / `.state.dart`) — `OnboardingConfigBloc`: loads `/app/onboarding-config` (locale-aware), reloads on locale switch, dedupes same-locale loads.
- `lib/src/features/onboarding/widgets/skip_bottom_sheet.sheet.dart` — shared 3-option skip sheet; pops itself before Skip / Don't show again navigate.
- Flow lives in `lib/src/core/navigation/app.router.dart` (go_router, not `main.dart`). `Skip for now` leaves `dontShowOnboarding` alone; `Don't show again` and finishing the tour persist it.

### Authentication — Stitch 006–009
- `lib/src/features/auth/auth_entry.screen.dart` (006) + `widgets/auth_entry_{background,content,header}.widget.dart`, `auth_guest_button.widget.dart`.
- `lib/src/features/auth/login.screen.dart` + `widgets/login_content.widget.dart` (007). The forgot-password link opens 011 (the parameter is still nullable so it *can* be hidden).
- `lib/src/features/auth/sign_up.screen.dart` + `widgets/sign_up_content.widget.dart` (008) — name / email / password / confirm; the confirm value is sent as `password_confirmation`.
- `lib/src/features/auth/verify_account.screen.dart` + `widgets/verify_account_content.widget.dart` + `widgets/otp_input_field.widget.dart` (009) — 6 digits, auto-advance, 60 s resend cooldown, masked destination, "Verify later" skip.
- `lib/src/features/auth/widgets/auth_text_field.widget.dart` — floating label, rounded-top/sharp-bottom underline, focus + error states, password toggle. Local to the app; promotion to `design_system` is Track 15.
- `lib/src/features/auth/widgets/auth_header.widget.dart`, `widgets/auth_shell.widget.dart` (responsive layout shared by all auth screens). The inline error row now comes from `design_system`'s `StatusBanner` — `auth_error_banner.widget.dart` was promoted and removed in Track 12.
- `lib/src/features/auth/auth_validators.entity.dart` — email / min-8 / confirmation-match, mirroring the backend rules.
- `lib/src/features/auth/auth_error.entity.dart` — maps exceptions to local ARB strings. The backend's own `message` is an untranslated key and must never be rendered.

## Continued in

- [Part 2: Password Recovery — Stitch 011–014](feature-index-part-2.md)
- [Part 3: My Bookings — Stitch 017a (CL-10a)](feature-index-part-3.md)
- [Part 4: Empty Scaffolds (no files yet)](feature-index-part-4.md)
