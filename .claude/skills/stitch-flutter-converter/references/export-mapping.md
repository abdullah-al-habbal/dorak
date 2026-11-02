---
nodeid: skills.repo.stitch-flutter-converter.references.export-mapping
parentnode: skills.repo.stitch-flutter-converter
childnodes: []
codeanchors:
  - frontend/mobile/
---

# Stitch export mapping

Exports live in `docs/stitch/exports/<NNN_name>/`. Run `scripts/preflight.sh` to list what is left; do not trust a hard-coded list (AGENTS.md says which are outstanding, and the folders are deleted as screens ship).

| Artifact | Role | Destination |
| --- | --- | --- |
| `DESIGN.md` | Global token spec, identical in every export. Already implemented. | Never regenerate tokens. If it differs from another export's copy, stop and report: that is a design-system change, not a screen. |
| `plan.md` | Per-screen contract: identity, sources of truth, backend contract, states, expected structure. | Read fully; reconcile against the code; update it with deliberate deviations, then delete with the folder. |
| `code.html` | Layout/behaviour source (the only screen-specific artifact). | Read for structure and behaviour. Never for styling values (use tokens) and never copy Tailwind classes. Delete when the screen ships. |
| `screen.png` | Final visual reference (spacing, proportions, positioning). | Compare against it; keep until verified. |
| Strings | User-visible copy | `packages/localization/l10n/app_{en,ar}.arb` |
| Images | Hero/background | `apps/*/assets/images/` + `pubspec.yaml` |
| Reusable sub-pieces | Widgets | `apps/*/lib/src/features/<feature>/widgets/*.widget.dart`; `design_system` only if reused across screens or apps |

## Before writing code
1. **Verify the plan's claimed state against the code.** `plan.md` may say "not implemented" while a feature folder exists (for example `features/discovery`). Grep the app for the feature, routes, and DTOs. If already integrated, verify and clean up; do not re-implement.
2. **Stitch is not the product.** Compare every data point and behaviour in `code.html` with the backend contract. Inspect real routes (`backend/routes`, `packages/core` endpoints and repositories). If the design shows something the backend lacks, or the plan contradicts the code, stop and report; do not invent endpoints, fields, or fake static data.
3. **Demo content** (names, ratings, distances, "Sponsored") may live only in tests, fixtures, or dev mocks. The exception is purely illustrative onboarding imagery, which is localized (see `onboarding-flow.md`).
4. **Locate the owner.** Find the Track and feature-registry ID (for example `CL-09`) in `docs/index.md` and `AGENTS.md`; mirror the structure of existing screens in the same feature folder.
5. **Find every consumer.** A new route, DTO, or string usually affects: the router and `app_routes.entity.dart`, `app.dart` DI/dispose, the repository in `core`, both ARB files, existing screens that linked to a placeholder, and tests. If the screen needs backend work that does not exist, hand that to `monorepo-task-executor` rather than faking it.

## Screens that carry state
Screens with real data follow `templates/data-screen-scaffold.md`: Bloc + event + state, loading/empty/error/offline/refresh states, pagination where the plan requires it, guest-access behaviour from the plan. Static onboarding screens follow `templates/onboarding-scaffold.md`.
