---
nodeid: mobile.references.root.commands
parentnode: mobile.guide
childnodes: []
codeanchors:
  - frontend/mobile/apps/
  - frontend/mobile/packages/
---

Referenced from [`../../AGENTS.md`](../../AGENTS.md).

## 5. Commands

`melos` is **not** on PATH — always invoke it through `dart run`.

```bash
cd frontend/mobile

dart run melos run generate    # flutter gen-l10n in packages/localization
dart run melos run build       # build_runner where json_serializable is declared
dart run melos run analyze     # flutter analyze, every package
dart run melos run taxonomy    # dart run tool/check_taxonomy.dart
dart run melos run test        # flutter test, every package

dart run melos run verify      # all five, in order — the gate
```

`verify` must exit 0 before any work is called done. All 6 workspace members (3 apps, 3 packages) analyze clean,
taxonomy passes and every test passes. Test counts are not pinned here — read them
from the latest `verify` run.

After editing an ARB file run `generate`. After editing a DTO run `build`.

---

