---
nodeid: backend.legacy_plan
parentnode: backend.guide
childnodes:
  - backend.docs
codeanchors:
  - backend/modules/
---

# Actionable Plan — Backend

> Repo entry doc. Read `../AGENTS.md` first (skills, conventions, gaps).
> State updated 2026-09-02 (Phase A complete), branch `dev`.
> Historical backend work log. Current cross-repository status is tracked in [`docs/todowork.md`](../../docs/todowork.md); see the [documentation graph](../../docs/INDEX.md).

## Phase A — Close the in-flight native-attribute refactor (P0) ✅ DONE 2026-09-02

Commit `3269f0c` (refactor) + `a43a45f` (skills) + `f8ad394` (docs).

- [x] A1: `composer test` — **500 passed** (2253 assertions)
- [x] A2: `vendor/bin/phpstan analyse` — no errors
- [x] A3: `vendor/bin/pint --test` — clean
- [x] A4: `RegisterHandler.php:25` now dispatches `(string) $client->id`;
      `argument.type` suppression removed from `phpstan-baseline.neon`
- [x] A5: committed in 3 logical commits (refactor / skills / docs)

## Phase B — Reconcile stale docs (P1)

- [x] B1: `AGENTS.md` gap reference repointed from `current_state.md` →
      `docs/14_execution-status.md` + `docs/actionable-plan.md` B4
- [x] B2: `process/KANBAN.md` — marked ARCHIVED with banner (reason + pointer)
- [x] B3: `docs/16_deployment-operations.md` TODO 44/45 — **still valid
      informational records** (composer advisories = separate task; pre-existing
      issues deliberately untouched). No closure needed. `docs/16` itself was
      extended with the production/main isolation decision (commit `f8ad394`)
- [ ] B4: Genuine gaps — record only, do NOT start:
      (updated by Task 87: the face-analysis pipeline exists —
      `ClientFaceProfile/Services/FaceAnalysisService.php`, dispatched on upload since Task 15 —
      and Pennant A/B exists in `ClientRecommendation/Features/ExploreRankingFeature.php`)
      Phase 3 "Power & Polish", ~8 open product
      decisions (see `AGENTS.md` → `docs/02_prd.md` §5 + §8).

## Verification (each task)

```bash
composer test
vendor/bin/phpstan analyse
vendor/bin/pint --test
```

## Links

- `process/KANBAN.md` — ticket board (archive target)
- `docs/14_execution-status.md` — execution history + test counts
- `docs/13_technical-concepts.md` — mandatory before feature work
