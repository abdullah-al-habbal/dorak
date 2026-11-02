---
nodeid: mobile.packages.localization
parentnode: mobile.guide
childnodes:
  - mobile.packages.localization.changelog
  - mobile.packages.localization.claude
  - mobile.packages.localization.readme
  - mobile.packages.localization.references.keys
  - mobile.packages.localization.part-2
codeanchors:
  - frontend/mobile/packages/localization/lib/
---

# AGENTS.md — `packages/localization`

Every user-visible string, EN + AR, via generated `AppLocalizations`.

Parent: [`../../AGENTS.md`](../../AGENTS.md) · Rules: [`CLAUDE.md`](./CLAUDE.md)

---

## 1. Layout

```
l10n/app_en.arb                       template — source of truth
l10n/app_ar.arb                       Arabic, identical key set
l10n.yaml                             gen-l10n config
lib/localization.dart                 barrel — exports app_localizations.dart only
lib/src/generated/                    committed, never hand-edited
  app_localizations.dart              abstract AppLocalizations
  app_localizations_en.dart
  app_localizations_ar.dart
```

`l10n.yaml`:

```yaml
arb-dir: l10n
template-arb-file: app_en.arb
output-localization-file: app_localizations.dart
output-dir: lib/src/generated
output-class: AppLocalizations
preferred-supported-locales: [en, ar]
```

Deps: `flutter`, `flutter_localizations`, `intl ^0.20.0`. `flutter: generate: true`.

## Continued in

- [Part 2: 2. Consuming it](agents-part-2.md)
