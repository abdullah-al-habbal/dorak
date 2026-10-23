Referenced from [`../AGENTS.md`](../AGENTS.md).

## 4. Widgets

| Widget | Constructor |
|---|---|
| `PrimaryButton` | `label`, `onPressed`, `isLoading`, `isDisabled`, `backgroundColor?` |
| `SecondaryButton` | `label`, `onPressed`, `isDisabled`, `foregroundColor?`, `borderColor?` |
| `SkipButton` | `label`, `onPressed`, `isDisabled` |
| `ProgressDots` | `count`, `activeIndex` |
| `OnboardingHeader` | `brandLabel`, `skipLabel`, `onSkip`, `localeLabel?`, `onLocaleToggle?` |
| `BottomSheetModal` | `child`, `onDismiss?` |
| `HeroImage` | `image`, `opacity`, `errorBuilder?` |
| `GradientOverlay` | — |
| `SwipeNavigation` | `child`, `onSwipeRight?`, `onSwipeLeft?`, `velocityThreshold` |
| `StatusView` | `icon`, `title`, `message?`, `actionLabel?`, `onAction?`, `iconColor?` |
| `AppLoader` | `.page()` 32px centred and expanding · `.inline({size = 20})` shrink-wrapped |
| `ShimmerBox` | `width`, `height`, `borderRadius?` — animated skeleton primitive |
| `StatusBanner` | `message`, `color?` (defaults to `colors.error`), `actionLabel?`, `onAction?` |

Notes:

- `PrimaryButton` is the **only** button with `isLoading` (20 px spinner
  replacing the label). `SecondaryButton` deliberately has none — no consumer
  has a loading secondary action yet; wrap it if that ever changes.
- Buttons are full-width pills with `radiusFull` and 16 px vertical padding.
  Label only — no trailing icons by default.
- `SkipButton` is a borderless shrink-wrapped `TextButton`
  (`minimumSize: Size.zero`, `MaterialTapTargetSize.shrinkWrap`) — use it for
  inline text links, not just Skip.
- `OnboardingHeader` has **no back affordance**. It is not a general app bar.
  Screens needing back build their own header (see `AuthHeader` in `client_app`).
- `BottomSheetModal` is a scrim + bottom container with `maxWidth: 448`, 24 px
  top radii and a drag handle. It does **not** call `showModalBottomSheet` —
  the caller does, then renders this as the sheet body.
- `HeroImage` takes an `ImageProvider`, not a URL. Asset-vs-network selection is
  the caller's job.
- `StatusView` is the single layout for empty / error / offline / retry — a
  centered icon, title, optional message and optional full-width action
  (`PrimaryButton`). Feature copy is the caller's ARB strings; no strings live
  here.
- `AppLoader.page()` fills and centres — full-page loading; `AppLoader.inline()`
  shrink-wraps — list footers.
- `ShimmerBox` is a hand-rolled `AnimationController` + `LinearGradient` +
  `ShaderMask` sweep (~40 lines, no `shimmer` package). It is the only animated
  state primitive; skeleton compositions are future compositions of it.
- `StatusBanner` is the promoted `AuthErrorBanner` (client_app §9 note). It is
  the compact inline message row under form actions, with an optional trailing
  text action.

