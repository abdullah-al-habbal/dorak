# Dorak — Actionable Plan (Router)

> **Entry file for all implementation work.** Updated 2026-09-02.
> This file routes. Execution detail lives in each repo's own
> `docs/actionable-plan.md`. Read this first, then the repo file.
>
> **CURRENT WORK — mobile Stitch 010 (Profile Completion).** Stitch 020
> (Client Review & Rating) is complete. The canonical record of mobile progress
> is **`frontend/mobile/docs/actionable-plan.md`**; this file is only the
> cross-repository router.

## Repo entry points

| Repo | Branch | Entry docs |
|---|---|---|
| Backend `backend/` | `dev` | `backend/AGENTS.md` → `docs/actionable-plan.md` |
| Mobile `frontend/mobile/` | `main` | `frontend/mobile/AGENTS.md` → `CLAUDE.md` → `docs/index.md` → `docs/actionable-plan.md` |

PHP work: read `.claude/skills/laravel-attributes/SKILL.md` and
`.claude/skills/laravel-native-abstractions/SKILL.md` before writing code.
Flutter work: read `.claude/skills/stitch-flutter-converter/SKILL.md`.

## Where work stands

| Repo | Status | Next action |
|---|---|---|
| Backend | Phase A **done** (refactor committed `3269f0c`, 500 tests, phpstan/pint clean); Phase B **done** (AGENTS repoint, KANBAN archived, TODO 44/45 asserted, `14_execution-status.md` 463→500) | B4 genuine-gap candidates — record-only |
| Mobile | Stitch 020 / Client Review & Rating (CL-13) **done** — review DTOs/repository, submission Bloc/screen, completed-booking Rate action, localized errors, tests, and export cleanup; gate exit 0 | **Stitch 010 / Profile Completion** — persistence, screen, route guard, and tests. See the canonical mobile plan. |

## Open decisions

- Q1: ✅ **Resolved** — backend refactor committed as 3 logical commits
  (refactor / skills / docs), not one. See `backend/docs/actionable-plan.md`.
- Q2: ✅ **Resolved** — mobile next track = **Track 10** (DI & bootstrap,
  application lifecycle). See `frontend/mobile/docs/actionable-plan.md`.
- Q3: Backend genuine gaps (AI face analysis MVP stub, A/B framework,
  Phase 3, ~8 product decisions) — record-only for now, start only on demand.

## Cross-repo guardrails

- Backend test gate is **local-only** (Husky pre-push = `pint --test` +
  `composer test`); CI checks formatting only. Never rely on CI for correctness.
- Do not leave new phpstan suppressions in `phpstan-baseline.neon` — fix with a
  cast/type instead.
- Mobile: never mark work done without `dart run melos run verify` exiting 0.
- Mobile: do not implement future Tracks early (`frontend/mobile/docs/index.md`);
  do not touch Stitch 010/015–020 `plan.md` until its Track opens.
- Commit Phase A before any other backend work — 36 dirty files block clean
  interleaving.

## Done checklist (all phases)

- [x] Backend Phase A: refactor committed `3269f0c`, suite 500 green, phpstan/pint clean
- [x] Backend Phase B: AGENTS repointed, KANBAN archived, TODO 44/45 asserted,
      `14_execution-status.md` count refreshed (463 → 500)
- [x] Mobile Phase C: gate green (157 tests), counts recorded, next track = Track 10
- [x] Mobile Track 10: lifecycle objective — resume probe tested + documented
      (`docs/runtime/app_lifecycle.md`), docs/index.md §6 updated, gate green
- [x] Mobile Discovery 016 scoping: backend Explore contract verified
      (`docs/future-features/discovery-016.md`); favorites absent backend-wide
      (product decision: ship without); Track 05 cache envelope + Track 11
      destinations defined
- [x] Mobile Track 05: cache strategy (`FeedCache`/`SharedFeedCache`, core,
      +11 tests, gate exit 0, 168 tests)
- [x] Mobile Track 11 UI placeholders: Bookings + Favorites screens, 6 new ARB
      keys (`bookingsTitle`, `bookingsSubtitle`, `bookingsActionLabel`,
      `favoritesTitle`, `favoritesSubtitle`, `favoritesActionLabel`), `generate`
      ran, `melos verify` exit 0, **170 tests**
- [x] Mobile Stitch 020: Client Review & Rating implemented and verified
- [x] Mobile and root actionable plans reconciled; mobile plan designated
      canonical
