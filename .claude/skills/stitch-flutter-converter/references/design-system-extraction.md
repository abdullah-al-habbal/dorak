---
nodeid: skills.repo.stitch-flutter-converter.references.design-system-extraction
parentnode: skills.repo.stitch-flutter-converter
childnodes: []
codeanchors:
  - frontend/mobile/
---

# Design-system extraction

A piece goes to `packages/design_system/lib/src/widgets/` ONLY when reused across screens or across apps. Otherwise it stays in the feature's `widgets/` folder.

## Do not trust a hard-coded inventory
The shared widget set grows (buttons, header, dots, sheet, hero, gradient, swipe, loader, locale switcher, shimmer, status banner/view, ...). Before creating anything:
1. Read `packages/design_system/AGENTS.md` (section "Widgets") and `ls packages/design_system/lib/src/widgets/`.
2. Reuse an existing widget, or extend it with a constructor parameter, rather than duplicating.
3. Check `packages/design_system/AGENTS.md` for gaps it records (for example no list item/avatar/tab widget) before concluding something is missing.

## Rules for a new shared widget
- One class per file: `<subject>.widget.dart`; export it from `design_system.dart`.
- Tokens only (`DorakColors.of(context)`, `DorakTypography`, `DorakDimensions`); no raw hex, no localization, no `core`, no app imports.
- Strings come in as parameters. Callbacks come in as parameters.
- Add a widget test in `packages/design_system/test/`; update the package AGENTS/inventory counts.
- Buttons are label-only by default (no trailing arrow).

## Recipes (validated against the tokens)
- Glass card: `surface.withValues(alpha: 0.8)`, border `primaryFixed.withValues(alpha: 0.5)`, `BoxShadow(surfaceTint @ 0.08, blur 24)`, `radiusLg`. No `BackdropFilter` needed.
- Progress bar: `ClipRRect(radiusFull)` > `SizedBox(height: 4)` > `ColoredBox(track)` > `FractionallySizedBox(widthFactor)` > `ColoredBox(fill)`. No custom painters.
- Blurred blobs: radial-gradient circle of `primaryFixedDim.withValues(alpha)`.
- Playful card layout: `Transform.rotate(±0.035)` / `Transform.translate`.
- Illustrative imagery: Material `Icons.*` in tinted containers, not the export's remote image URLs.
