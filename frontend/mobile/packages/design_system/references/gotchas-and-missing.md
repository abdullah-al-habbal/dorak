---
nodeid: mobile.packages.design-system.references.gotchas-and-missing
parentnode: mobile.packages.design-system
childnodes: []
codeanchors:
  - frontend/mobile/packages/design_system/lib/
---

Referenced from [`../AGENTS.md`](../AGENTS.md).

## 5. Missing — do not assume these exist

No text field, password field, OTP input, checkbox, radio, switch, select,
search, phone or email input. No app bar, dialog, snackbar, toast, chip, card,
list item, avatar, tab. No permission-required state widget — there is no
permission mechanism in the workspace and Track 12 defers it (owner: Tracks
13/14, triggered by 016). No precision skeleton compositions for card/list/
profile shimmer — those are compositions of `ShimmerBox`.

`docs/design-system/components/**` contains ~125 markdown specs for these —
**all 0 bytes**. They are Track 15 placeholders, not designs.


## 6. Gotchas

- **Fonts are bundled and declared here.** The `cursor/skills/stitch-flutter-converter/SKILL.md`
  note that IBM Plex is "deferred, no `.ttf` in the repo" is stale — the files
  are in `fonts/` and wired into `pubspec.yaml`.
- **Never `Image.asset` an SVG.** Flutter cannot decode it and throws at
  runtime. Convert to PNG/JPG or add `flutter_svg`.
- **`OnboardingHeader` fits its brand into a `Flexible` with ellipsis** so the
  locale toggle and Skip keep their space on narrow screens. Keep it that way.
- **The test-suite font is not IBM Plex.** Flutter's test fallback renders every
  glyph at full em width, roughly double. A `RenderFlex overflowed` in a widget
  test is not proof of a device bug — measure before changing layout.
- **`design_system` has no example app.** Verify rendering through
  `client_app`.

