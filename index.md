# Dorak Monorepo Master Rulebook

## Entry Points for AI Agents

- Mobile work → read **`frontend/mobile/AGENTS.md`** first, then `frontend/mobile/CLAUDE.md`, then `frontend/mobile/docs/index.md`.
- Backend work → read **`backend/AGENTS.md`** first.

## Architecture Overview
This repository uses a Dart Workspace monorepo structure containing mobile applications and shared local packages alongside the backend service.

### Directory Structure
- `backend/`: Core backend service and API services.
- `frontend/mobile/`: Flutter mobile application workspace.
  - `apps/`: Target applications (`client_app`, `business_app`, `stylist_app`).
  - `packages/`: Shared feature and core packages (`core`, `design_system`, `localization`, `feature_floor_plan`).
- `docs/`: Architectural decision records (ADRs) and documentation.

## Monorepo Guidelines
1. **Workspace Resolution**: All apps and packages under `frontend/mobile/` must maintain `resolution: workspace` in their `pubspec.yaml`.
2. **Local Package Referencing**: Apps consume internal packages via relative path dependencies (`../../packages/`).
3. **AI Context Scope**: Heavy binaries, backend sources, and generated Flutter files (`*.g.dart`, `*.freezed.dart`) are excluded via `.aiignore`.
