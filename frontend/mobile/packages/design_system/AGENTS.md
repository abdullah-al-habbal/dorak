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


## More

| Topic | Read |
| --- | --- |
| Design tokens (`DorakColors`, `DorakTypography`, `DorakDimensions`) | [`references/tokens.md`](references/tokens.md) |
| Widget catalogue | [`references/widgets.md`](references/widgets.md) |
| Missing widgets & gotchas | [`references/gotchas-and-missing.md`](references/gotchas-and-missing.md) |

## 7. Adding a widget

1. Confirm it is genuinely cross-app. If only one feature uses it, it belongs
   in that app.
2. `lib/src/widgets/<subject>.widget.dart`, one class.
3. Strings and callbacks as constructor parameters. No `AppLocalizations`.
4. Tokens only — `DorakColors.of(context)`, `DorakTypography`,
   `DorakDimensions`.
5. Export from `lib/design_system.dart`.
6. `dart run melos run analyze && dart run melos run taxonomy`.
7. Record it in `docs/feature-index.md` and in §4 above.

## 8. Tests

`test/` holds 14 widget tests: `locale_switcher_test.dart` (2),
`status_banner_test.dart` (3), `status_view_test.dart`
(4), `app_loader_test.dart` (2), `shimmer_box_test.dart` (2), plus the original
`design_system_test.dart` placeholder. There are no golden tests. Real usage
coverage of the button/header widgets comes from `client_app`'s widget tests.
