---
nodeid: mobile.packages.localization
parentnode: mobile.guide
childnodes: []
codeanchors:
  - frontend/mobile/packages/localization/lib/
---

# `packages/localization`

Every user-visible string, English and Arabic, as the generated `AppLocalizations`. Adds to the
[mobile guide](../../AGENTS.md).

## Dependencies

`flutter`, `flutter_localizations` and `intl` only. Never `core`, `design_system` or app code. All three apps
share one pair of ARB files; splitting them needs a deliberate decision, not ad hoc prefixes.

## Rules

- `l10n/app_en.arb` is the template. Every key exists in both ARB files.
- Arabic is a real translation, never transliterated or left in English. Arabic calls the stylist "المصفف"
  (a test enforces it).
- Never edit `lib/src/generated/` by hand. Change the ARB, run `dart run melos run generate` and commit the
  output.
- Keys are camelCase with a feature prefix. Search the ARB before adding one; generic keys such as `cancel`,
  `next` and `errorGeneric` are meant to be shared.
- Give each key an `@key` description. A `{placeholder}` needs a typed `placeholders` entry.
- Demo and illustrative text is localized too.
- A third locale needs a new ARB file and an entry in `preferred-supported-locales` (`l10n.yaml`).

## Checks

`test/localization_test.dart` checks equal key sets, no empty messages, placeholder agreement, duplicate keys
and the stylist term. `packages/core/test/wire_enum_fixture_test.dart` checks wire enums against the backend
fixture.
