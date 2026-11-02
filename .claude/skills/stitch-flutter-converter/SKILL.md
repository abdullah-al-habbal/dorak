---
name: stitch-flutter-converter
description: Converts a Stitch design export (docs/stitch/exports/NNN_name) into a production-ready, atomic Flutter implementation in the Dorak mobile workspace, with plan-vs-code-vs-backend audit, tokens/localization/design-system/Bloc/go_router conventions, EN+AR parity, full melos verify gate, doc updates, export cleanup, and a local-only commit. Use when asked to convert, implement, integrate, verify, or clean up a Stitch export or screen such as "Stitch 016". The skill name plus an export ID is a sufficient request.
nodeid: skills.repo.stitch-flutter-converter
parentnode: skills.repo
childnodes:
  - skills.repo.stitch-flutter-converter.references.design-system-extraction
  - skills.repo.stitch-flutter-converter.references.export-mapping
  - skills.repo.stitch-flutter-converter.references.gates-and-cleanup
  - skills.repo.stitch-flutter-converter.references.gotchas
  - skills.repo.stitch-flutter-converter.references.localization-assets
  - skills.repo.stitch-flutter-converter.references.onboarding-flow
  - skills.repo.stitch-flutter-converter.references.principles
  - skills.repo.stitch-flutter-converter.templates.data-screen-scaffold
  - skills.repo.stitch-flutter-converter.templates.final-report
  - skills.repo.stitch-flutter-converter.templates.onboarding-scaffold
codeanchors:
  - frontend/mobile/
---

# Stitch Export → Flutter Atomic Converter

## Invocation

> Convert Stitch 016 using stitch-flutter-converter.

Nothing else is required. The audit, conventions, gates, docs, cleanup, and local commit below are the default behaviour. All paths are relative to `frontend/mobile/` unless stated.

## Folder map (load on demand)

| Path | Use it when |
| --- | --- |
| `scripts/preflight.sh [id]` | Step 1: lists remaining exports; inventories one, prints plan outline, DESIGN.md sameness, current execution point, guides to read |
| `scripts/check-screen-hygiene.sh` | Steps 6-7: raw colors, inline strings, svg assets, Navigator 1.0, relative imports, role suffixes, EN/AR parity |
| `references/principles.md` | Step 2: taxonomy, layering, state, navigation, DTO codegen rules and their authority order |
| `references/export-mapping.md` | Steps 2-3: artifact roles, verifying plan vs code vs backend, locating the owner |
| `references/design-system-extraction.md` | Step 4: reuse before creating; rules and recipes for shared widgets |
| `references/localization-assets.md` | Step 5: ARB, RTL, assets, fonts |
| `references/onboarding-flow.md` | Only for onboarding screens |
| `references/gotchas.md` | Step 5: pitfalls learned |
| `references/gates-and-cleanup.md` | Steps 7-9: gate, tests to add, docs to update, cleanup, commit |
| `templates/data-screen-scaffold.md`, `templates/onboarding-scaffold.md` | Step 4: file layout and checklists |
| `templates/final-report.md` | Step 10 |

## Workflow

1. **Establish the workspace.** Run `scripts/preflight.sh <id>`. Preserve unrelated edits; never stage them; never push or touch remotes.
2. **Audit before code.** Read root `CLAUDE.md`/`AGENTS.md` (repo rules), `frontend/mobile/CLAUDE.md` + `AGENTS.md`, the target app/package guides, `docs/index.md` (track, Current Execution Point), the export's `plan.md` in full, and existing screens in the same feature folder. Follow `references/principles.md` and `references/export-mapping.md`.
3. **Reconcile three sources.** `plan.md` vs the repository vs the backend contract. Check whether the screen is already integrated, whether `DESIGN.md` differs from other exports, and whether the design assumes data or behaviour the backend lacks. If anything is contradictory, inaccurate, or needs an invented endpoint, stop and report it with evidence; do not guess or fake data. Backend gaps go to `monorepo-task-executor`.
4. **Define the slice and build it.** List core (endpoints/DTO/repository/Bloc), app (screen, widgets, route, DI), design_system, localization, assets, tests, docs. Reuse before creating (`references/design-system-extraction.md`). Use the matching scaffold template. Strings first: add to BOTH ARB files, run `flutter gen-l10n`.
5. **Implement with local conventions.** One class per file, dot-suffix roles, `package:` imports only, tokens not literals, go_router not Navigator 1.0, codegen DTOs. Write the Bloc/flow/repository/widget tests with the screen, not after.
6. **Iterate narrowly.** Focused analyze/test on touched packages; run `scripts/check-screen-hygiene.sh`; `dart format` only touched files.
7. **Run the gate** in `references/gates-and-cleanup.md`, ending with `dart run melos run verify`. Never claim a pass without seeing it.
8. **Update docs.** `docs/index.md` Current Execution Point and track, `docs/feature-index.md`, `docs/navigation/routes.md`, app/package `AGENTS.md` inventories and counts. Record deliberate deviations from `plan.md`.
9. **Clean up, then commit locally.** Only after the gate is green: delete the export folder and any matching zip. Review `git diff`, revert unrelated formatter output, stage only task files, commit (`feat(mobile): ... (Stitch NNN)` + session attribution), let hooks finish.
10. **Report** with `templates/final-report.md`: SHA, audit findings, per-layer changes, gate table with test counts, deviations, follow-ups.

## Guardrails

- `DESIGN.md` is the global design system, not a screen spec: never regenerate tokens from it.
- `code.html` is read for layout and behaviour, never copied; Tailwind classes map to tokens.
- Stitch demo data never becomes production data.
- A child `CLAUDE.md` never relaxes a parent rule; follow the narrowest applicable guide.
- Keep this file under 500 lines and each reference under 200; put new detail in `references/` or `templates/`.
