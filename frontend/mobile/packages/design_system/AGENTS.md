---
codeanchors:
  - frontend/mobile/packages/design_system/lib/
---

# `packages/design_system`

Tokens, theme, bundled fonts and cross-app widgets. Adds to the [mobile guide](../../AGENTS.md).

## Dependencies

Flutter and third-party packages only. **Never `localization`, `core` or app code.** `go_router` is here only for
`BottomSheetModal`'s `context.pop()`
([ADR 0002](../../docs/architecture/decisions/0002-design-system-go-router.md)), so a consumer needs a `GoRouter`
ancestor or must pass `onDismiss`. Any further application dependency needs a new ADR.

## Rules

- No business logic: widgets take data and callbacks. No network, persistence or app navigation.
- No strings. Every label is a constructor parameter.
- Hex literals only in `src/tokens/`. Widgets read `DorakColors.of(context)`, `DorakTypography` and
  `DorakDimensions`, not `Theme.of`. This is the only package that defines raw colour, type and size values.
- One widget per `<subject>.widget.dart`, exported from `lib/design_system.dart`. Other roles allowed here are
  `token`, `theme` and `barrel`.
- Right-to-left safe: directional alignment and padding, no hardcoded left or right.
- No unbounded text in a `Row`; use `Flexible` or `Wrap`. Arabic and large text are wider.
- Add a widget only when more than one app uses it, when Track 15 specifies it, or when it is a shared loading,
  empty, error, offline, retry or session state. Feature widgets stay in their app.
- The IBM Plex fonts are declared here; apps don't redeclare them.

## Behaviour to know

- `DorakTheme` doesn't configure every component theme. For example it sets no input decoration theme.
- `BottomSheetModal` is only the sheet body; the caller shows the sheet.
- `OnboardingHeader` has no back button and isn't a general app bar. Keep its brand flexible with an ellipsis.
- `HeroImage` takes an `ImageProvider`; choosing asset or network is the caller's job.
- Don't pass an SVG to `Image.asset`.
- There is no example app; check rendering in `client_app`. Widget tests are in `test/`.
