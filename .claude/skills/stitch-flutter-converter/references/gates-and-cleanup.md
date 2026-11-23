---
nodeid: skills.repo.stitch-flutter-converter.references.gates-and-cleanup
parentnode: skills.repo.stitch-flutter-converter
childnodes: []
codeanchors:
  - frontend/mobile/
---

# Gates, docs, cleanup, commit

Run from `frontend/mobile/` (use `dart run melos run <script>`; `melos` is not on PATH).

## Gate (mandatory before "done")
1. `cd packages/localization && flutter gen-l10n` after ARB edits.
2. `dart run melos run build` after DTO edits.
3. Focused: `flutter analyze` and `flutter test` in each touched package/app; `dart run tool/check_taxonomy.dart`.
4. `scripts/check-screen-hygiene.sh` (raw colors, inline strings, svg assets, Navigator 1.0, relative imports, ARB parity).
5. Full: `dart run melos run verify` (generate incl. build_runner, analyze, taxonomy, test). Record the test counts.

## Tests to add
- Bloc test for each new Bloc (loading, success, empty, error, retry, pagination as applicable) using the repository fakes in `apps/client_app/test/helpers`.
- Widget/flow test for the screen: states render, callbacks fire, route reached, Arabic locale renders.
- Repository test in `packages/core` for new endpoints/DTOs.
- Design-system widget test for any new shared widget.

## Docs to update
- `docs/index.md` "Current Execution Point" and the track entry; `docs/feature-index.md`; `docs/navigation/routes.md` for new routes; the app/package `AGENTS.md` inventories and counts (ARB keys, widgets, tests).
- Root `docs/` only if a backend contract changed.

## Cleanup (only after the gate is green)
Delete the export folder (`DESIGN.md`, `plan.md`, `code.html`, `screen.png`) and any matching `.zip`. Order: verify, clean up, next export. Do not delete a folder whose screen is not integrated.

## Commit (local only)
`git diff --check`, review `git diff`/`git status`, revert unrelated formatter output, stage only task files, commit with a conventional message (`feat(mobile): ... (Stitch NNN)`) plus the session attribution. Never push or touch remotes.
