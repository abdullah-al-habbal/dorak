---
nodeid: mobile.references.root.design-system
parentnode: mobile.guide
childnodes: []
codeanchors:
  - frontend/mobile/apps/
  - frontend/mobile/packages/
---

Referenced from [`../../AGENTS.md`](../../AGENTS.md).

## 10. Design system — reuse, do not recreate

`packages/design_system/lib/src/widgets/` — all string-parameterised:

`primary_button` (has `isLoading`) · `secondary_button` · `skip_button` ·
`progress_dots` · `onboarding_header` · `locale_switcher` ·
`bottom_sheet_modal` ·
`gradient_overlay` · `hero_image` · `swipe_navigation` · `status_view` ·
`app_loader` · `shimmer_box` · `status_banner`

Tokens: `DorakColors` (49 semantic fields incl. `inputBgSoft` / `inputBgFocus`
for field states), `DorakTypography` (10 styles), `DorakDimensions`,
`DorakTheme.forLocale(locale, brightness)` (swaps to the Arabic font family).

`DorakTheme` has **no** `inputDecorationTheme` — fields build their own
decoration.

Extract a widget into `design_system` only when it is genuinely reused across
apps, or when it is a Track 12 global UI-state component (loading / empty /
error / offline / retry / session states). Otherwise keep it in
`apps/*/lib/src/features/<feature>/widgets/`.

---

