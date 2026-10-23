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

`verify` must exit 0 before any work is called done. Current baseline
(re-baselined 2026-09-14): 7 packages analyze clean, taxonomy passes,
**288 tests pass** (121 core, 153 client_app, 14 design_system, 1 each for
business_app, stylist_app, localization, feature_floor_plan).

After editing an ARB file run `generate`. After editing a DTO run `build`.

---

