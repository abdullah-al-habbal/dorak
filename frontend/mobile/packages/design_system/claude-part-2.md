---
nodeid: mobile.packages.design-system.claude.part-2
parentnode: mobile.packages.design-system.claude
childnodes: []
codeanchors:
  - frontend/mobile/packages/design_system/lib/
---

Part 2 of 2 · [CLAUDE.md — packages/design_system](CLAUDE.md) · [Previous](CLAUDE.md)

## 4. Hard rules

1. **No business logic.** Widgets take data and callbacks and render. No
   network calls, no persistence, no application navigation. The **only**
   navigation call in the package is `BottomSheetModal`'s `context.pop()` —
   local modal-route dismissal, never app routing.
2. **No strings.** Every label is a parameter. No hardcoded English, no
   `AppLocalizations`.
3. **Hex literals live only in `src/tokens/`.** Everything else reads
   `DorakColors.of(context)`. A `Color(0xFF…)` in a widget file is a defect.
4. **Widgets consume tokens, not `Theme.of`.** Use `DorakColors.of(context)`,
   `DorakTypography.*`, `DorakDimensions.*`.
5. **One widget per file**, named `<subject>.widget.dart`, exported from
   `lib/design_system.dart`.
6. **RTL-safe by construction.** Use `AlignmentDirectional`, `EdgeInsetsDirectional`
   and `TextAlign.start`. Never hardcode left/right. Directional icons follow
   `isRtl ? Icons.arrow_forward : Icons.arrow_back`.
7. **No unbounded text in a `Row`.** Wrap in `Flexible` or use `Wrap`. Arabic
   and large text scales are wider than the English mock.
8. **Promotion is deliberate.** A widget belongs here only when it is genuinely
   used by more than one app, or is specified by Track 15, or is a Track 12
   global UI-state component (loading, empty, error, offline, retry, session
   states). Feature-local widgets stay in
   `apps/*/lib/src/features/<feature>/widgets/`. Do not pre-emptively hoist.
9. **Fonts are bundled here.** `IBM Plex Sans` and `IBM Plex Sans Arabic` ship
   in `fonts/` and are declared in this package's `pubspec.yaml`. Apps must not
   re-declare them.

## 5. Verification

```bash
cd frontend/mobile
dart run melos run analyze
dart run melos run test
```

Rendering changes should be checked in `client_app` — this package has no
example app. `test/` holds real widget tests for the state components
(`status_banner`, `status_view`, `app_loader`, `shimmer_box`); the original
placeholder is still in `test/design_system_test.dart`.
