---
nodeid: skills.repo.stitch-flutter-converter.references.gotchas
parentnode: skills.repo.stitch-flutter-converter
childnodes: []
codeanchors:
  - frontend/mobile/
---

# Gotchas

1. Unused constructor params fail `flutter analyze`; pass only what the screen uses.
2. Raw `Color(0x...)` in app code is a defect; use token fields with `withValues(alpha:)` for translucency.
3. `Image.asset` on `.svg` crashes at runtime.
4. Plan-to-code drift must be deliberate and written down (taxonomy renames, resolved TODOs). Reconcile naming, counts, CTA labels against `plan.md` after implementing.
5. Do not re-implement an already-integrated export; verify, then clean up.
6. `plan.md` "current repository state" can be stale; the code decides.
7. A visible dead control (for example a forgot-password link with no flow) is worse than none; hide it with a nullable callback until the flow exists.
8. Do not regenerate tokens from `DESIGN.md`.
9. Do not hard-code Stitch demo data as production entities.
10. `dart format` only on files you touched; workspace-wide formatting rewrites unrelated files. `melos` is not on PATH: `dart run melos run <script>`.
11. After editing a DTO, run `dart run melos run build` and commit the `*.g.dart`.
12. Changing a route means updating `docs/navigation/routes.md` and any screen that linked to the old placeholder.
13. Pre-commit hooks may run formatters on staged files; let them finish, never bypass.
