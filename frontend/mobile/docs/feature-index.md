---
nodeid: mobile.feature-index
parentnode: mobile.docs
childnodes:
  - mobile.feature-index.part-2
  - mobile.feature-index.part-3
  - mobile.feature-index.part-4
  - mobile.feature-index.part-5
codeanchors:
  - frontend/mobile/apps/client_app/lib/
---

# Feature Index — Dorak Mobile (Flutter Monorepo)

> **Append entry after adding each feature.** This is the chronological map of every feature built across the monorepo. Per-app indexes: [`apps/client_app/docs/feature-index.md`](../apps/client_app/docs/feature-index.md), [`apps/business_app/docs/feature-index.md`](../apps/business_app/docs/feature-index.md), [`apps/stylist_app/docs/feature-index.md`](../apps/stylist_app/docs/feature-index.md).

---

## Shared Packages

### design_system
- `DorakColors` — `colors.token.dart`, light + dark palettes, accessed via `DorakColors.of(context)` (theme aware). All raw hex lives here, nowhere else.
- `DorakTypography` — `typography.token.dart` (IBM Plex Sans, deferred fonts via `fontFamilyFallback`).
- `DorakDimensions` — `dimensions.token.dart` (spacing, radii, max-widths).
- `tokens.barrel.dart` — barrel export of all token files.
- `DorakTheme` — `dorak_theme.theme.dart`, `DorakTheme.forLocale(locale, brightness)`.
- Shared widgets (each its own file, one class each, string-parameterized — design_system never imports localization):
  - `primary_button.widget.dart` — full-width pill, `radiusFull`, `primaryContainer`, optional `isLoading`/`isDisabled`
  - `secondary_button.widget.dart` — outlined pill for Back/secondary actions
  - `skip_button.widget.dart` — borderless shrink-wrap `TextButton`
  - `progress_dots.widget.dart` — `count` + `activeIndex`
  - `onboarding_header.widget.dart` — brand icon + label, locale toggle, Skip (all strings injected)
  - `bottom_sheet_modal.widget.dart` — modal wrapper
  - `gradient_overlay.widget.dart`
  - `hero_image.widget.dart` — local-asset-first image with remote override + `errorBuilder`
  - `swipe_navigation.widget.dart` — swipe-left/right gesture routing
  - `status_view.widget.dart` — Track 12: empty / error / offline / retry (centred icon + title + message? + action?)
  - `app_loader.widget.dart` — Track 12: `AppLoader.page()` full-page / `AppLoader.inline()` footer spinner
  - `shimmer_box.widget.dart` — Track 12: animated skeleton primitive (hand-rolled, no package)
  - `status_banner.widget.dart` — Track 12: compact inline message row (promoted from auth's `AuthErrorBanner`, used by login/sign-up/verify)
  - `locale_switcher.widget.dart` — shrink-wrap `TextButton`, `label` + `onPressed` (the shared EN/AR toggle button; rendered identically by `OnboardingHeader` and auth's `AuthHeader`/entry)

### feature_error_feedback
- `ErrorFeedback` (action and load messages, field errors), `SafeServerMessage`, `DeleteAccountErrorMessage`, `ExternalLinkFeedback`, `InlineError`. Used by all three apps; see `packages/feature_error_feedback/AGENTS.md`.

### localization
- Source of truth: `l10n/app_en.arb` (template) + `app_ar.arb` (Arabic). Every key exists in BOTH locales.
- Generated output `lib/src/generated/` via `flutter gen-l10n` (committed, excluded from analyzer/taxonomy).
- RTL handled by Flutter locale resolution automatically.

## Continued in

- [Part 2: core](feature-index-part-2.md)
- [Part 3: Password Recovery — Stitch 011–014](feature-index-part-3.md)
- [Part 4: Business App (apps/business_app)](feature-index-part-4.md)
- [Part 5: Feature Registry](feature-index-part-5.md)
