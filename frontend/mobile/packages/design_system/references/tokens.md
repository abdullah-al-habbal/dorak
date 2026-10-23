Referenced from [`../AGENTS.md`](../AGENTS.md).

## 2. Tokens

### `DorakColors` — 49 semantic fields

Instance fields, not statics. Access is always theme-aware:

```dart
final colors = DorakColors.of(context);   // picks light or dark
```

`static const DorakColors light` / `dark` are the two palettes.

Groups: `background`/`onBackground`; `surface`, `surfaceBright`, `surfaceDim`,
`surfaceContainerLowest…Highest`, `surfaceVariant`, `onSurface`,
`onSurfaceVariant`, `inverseSurface`, `inverseOnSurface`, `surfaceTint`;
`outline`, `outlineVariant`; `primary`/`secondary`/`tertiary` each with
`on*`, `*Container`, `on*Container`; `inversePrimary`; `error`, `onError`,
`errorContainer`, `onErrorContainer`; the `*Fixed`, `*FixedDim`, `on*Fixed`,
`on*FixedVariant` set; and **`inputBgSoft`** / **`inputBgFocus`** — the
form-field fill pair (5% / 10% tint).

### `DorakTypography` — 10 styles

`displayLg` `headlineLg` `headlineLgMobile` `headlineMd` `headlineSm`
`titleLg` `bodyLg` `bodyMd` `labelLg` `labelMd`

Plus `fontFamily` (`IBM Plex Sans`), `fontFamilyArabic`
(`IBM Plex Sans Arabic`), `fontFamilyFallback`.

`bodyMd` and `labelLg` are both 14 px — `labelLg` is w600 with letter-spacing.

### `DorakDimensions`

`unit` 8 · `gutter` 24 · `marginMobile` 20 · `marginDesktop` 64 ·
`containerMaxWidth` 1280
`radiusSm` 4 · `radiusDefault` 8 · `radiusMd` 12 · `radiusLg` 16 ·
`radiusXl` 24 · `radiusFull` 9999
`spacingSmall` 8 · `spacingMedium` 16 · `spacingLarge` 24 · `spacingXLarge` 32

