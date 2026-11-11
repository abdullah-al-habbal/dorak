---
nodeid: backend.guide.part-2
parentnode: backend.guide
childnodes: []
codeanchors:
  - backend/modules/
  - backend/bootstrap/
---

Part 2 of 2 · [AGENTS](AGENTS.md) · [Previous](AGENTS.md)

## Remaining Gaps (from `docs/02-prd.md` §5 + §8)

All original backend gaps resolved — Application, OfferedService, Ban, Social Login APIs all built and contract-tested.

Genuine remaining gaps (not in code): A/B testing framework, real AI face analysis (`modules/ClientFaceProfile/Jobs/AnalyzeFacePhotoJob.php` is an MVP stub), Phase 3 "Power & Polish", ~8 open product decisions. See `docs/14-execution-status.md`.

> **Frontend (2026-08-09):** Flutter apps removed from this repo — moved to `~/dorak-frontend`, being rebuilt from scratch (new UI/UX). Backend docs referencing `dorak-frontend/apps/...` paths are historical; the API contract sections (`docs/feature-index.md`, `docs/13-technical-concepts.md`) remain the stable contract for the rebuild.

## Framework

- Laravel ^13.8, PHP ^8.3
- Spatie Permissions, Spatie Translatable, Sanctum, Socialite
- Vite with Tailwind CSS v4, `@tailwindcss/vite` plugin
