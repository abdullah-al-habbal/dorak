---
nodeid: skills.repo.stitch-flutter-converter.templates.final-report
parentnode: skills.repo.stitch-flutter-converter
childnodes: []
codeanchors:
  - frontend/mobile/
---

**Stitch <NNN> <name> is <integrated | verified already integrated> and committed locally as `<sha>`.** Nothing was pushed.

**Audit findings**
- Plan vs code vs backend: <state claimed, state found, mismatches and how resolved or escalated>
- DESIGN.md identical to other exports: <yes/no>

**What changed**
- Core (endpoints / DTOs / repository / Bloc): <...>
- App (<app>): feature files, routes, DI: <...>
- design_system: <reused widgets / new widget + test>
- Localization: <n keys added, EN/AR parity>
- Assets: <...>
- Docs: <index, feature-index, routes, AGENTS counts>
- Export folder + zip: <deleted | kept, why>

**Gates**
| Gate | Command | Result |
| --- | --- | --- |
| Localization | `flutter gen-l10n` | <ok> |
| Taxonomy | `dart run tool/check_taxonomy.dart` | <ok> |
| Hygiene | `scripts/check-screen-hygiene.sh` | <ok> |
| Full | `dart run melos run verify` | <exit 0, N tests (core / apps / design_system)> |

**Deliberate deviations from plan.md:** <list or none>
**Not done / follow-ups:** <list or none>
