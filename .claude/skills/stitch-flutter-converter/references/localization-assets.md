---
nodeid: skills.repo.stitch-flutter-converter.references.localization-assets
parentnode: skills.repo.stitch-flutter-converter
childnodes: []
codeanchors:
  - frontend/mobile/
---

# Localization, assets, fonts

## Localization
- Source of truth: `packages/localization/l10n/app_en.arb` (template) and `app_ar.arb`.
- Every key exists in BOTH files; Arabic is a real translation, not transliteration. Use ICU plurals with correct Arabic categories (`=1`, `=2`, `few`, `other`) for counted strings.
- camelCase keys, feature-prefixed (`bookingTitle`); one key per string; add `@key` descriptions/placeholders for parameterised strings.
- Reuse existing keys (`skip`, `next`, `previous`, `cancel`, ...) before adding new ones.
- After editing run `flutter gen-l10n` in `packages/localization`; generated output under `lib/src/generated/` is committed and excluded from analysis/taxonomy.
- `scripts/check-screen-hygiene.sh` verifies EN/AR key parity and flags inline `Text('...')` literals.
- RTL: Flutter flips direction for `ar`. Use `Align`/`TextAlign.start`, `EdgeInsetsDirectional`; never hard-code left/right. Verify at least one screen state in Arabic.
- Locale toggle label: `isArabic ? l10n.localeEnglish : l10n.localeArabic`.

## Assets
- NEVER ship `.svg` through `Image.asset`: it cannot decode SVG and fails at runtime (this shipped once, masked by opacity). Use `.png`/`.jpg`, or add `flutter_svg` deliberately.
- Keep `cacheWidth`/`cacheHeight` on large images.
- Hero pattern: local asset fallback with optional remote override, `errorBuilder` back to the asset (`onboarding_hero.widget.dart`).
- Declare asset folders in the app's `pubspec.yaml`.

## Fonts
IBM Plex Sans and Plex Sans Arabic are bundled in `packages/design_system/fonts/`. Use the token `fontFamily`/`fontFamilyArabic`/`fontFamilyFallback`; do not add per-app font declarations.
