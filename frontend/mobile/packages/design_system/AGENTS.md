---
nodeid: mobile.packages.design-system
parentnode: mobile.guide
childnodes:
  - mobile.packages.design-system.changelog
  - mobile.packages.design-system.claude
  - mobile.packages.design-system.readme
  - mobile.packages.design-system.references.gotchas-and-missing
  - mobile.packages.design-system.references.tokens
  - mobile.packages.design-system.references.widgets
  - mobile.packages.design-system.part-2
codeanchors:
  - frontend/mobile/packages/design_system/lib/
---

# AGENTS.md — `packages/design_system`

Tokens, theme, fonts, and cross-app widgets. No strings, no logic, no `core`.

Parent: [`../../AGENTS.md`](../../AGENTS.md) · Rules: [`CLAUDE.md`](./CLAUDE.md)

---

## 1. Layout

```
lib/design_system.dart              root barrel — tokens + theme + 14 widgets
lib/src/tokens/
  colors.token.dart                 DorakColors
  typography.token.dart             DorakTypography
  dimensions.token.dart             DorakDimensions
  tokens.barrel.dart
lib/src/theme/
  dorak_theme.theme.dart            DorakTheme
lib/src/widgets/                    14 widgets, one class each
fonts/                              IBM Plex Sans + Arabic, 4 weights each
```

Declared-but-empty directories: `lib/src/tokens/{colors,elevation,radii,spacing,typography}/`
and `lib/src/components/{avatars,bottom_sheets,buttons,cards,inputs}/`. The real
widgets live in `lib/src/widgets/` — **do not** start using `components/`
without deciding the convention first.


## 3. Theme

```dart
DorakTheme.light
DorakTheme.dark
DorakTheme.forLocale(locale, brightness)   // swaps to the Arabic family for 'ar'
```

`_build` maps the full `ColorScheme`, all 10 text styles into `textTheme`, and
forces `radiusFull` on `elevatedButtonTheme`.

**Not configured:** `inputDecorationTheme`, `outlinedButtonTheme`,
`textButtonTheme`, `bottomSheetTheme`, `appBarTheme`, `dialogTheme`,
`snackBarTheme`. Components that need those styles build their own decoration —
`AuthTextField` in `client_app` is the current example.

## Continued in

- [Part 2: More](agents-part-2.md)
