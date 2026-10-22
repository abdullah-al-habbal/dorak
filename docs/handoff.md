# Handover Guide for a New Agent

Audience: a fresh AI session starting work in the Dorak monorepo with no prior
context. Read this first, then follow the links it gives you. The goal is to
make investigation fast and powerful without re-discovering the same facts.

## 1. Orient in this order

1. `AGENTS.md` (repo root) — repo map, hard rules, doc index.
2. The task spec under `docs/tasks/` (e.g.
   `docs/tasks/task-21-slot-availability-endpoint.md`) — full scope and
   acceptance criteria. This is the source of truth.
3. `docs/todowork.md` — the work tracker, one checkbox per task.
4. `docs/decisions-required.md` — open product decisions tagged by task.
5. The relevant subsystem guide and its child guides:
   - Backend: `backend/AGENTS.md` + `backend/CLAUDE.md`.
   - Dashboard: `frontend/dashboard/AGENTS.md` + `CLAUDE.md`.
   - Mobile: `frontend/mobile/AGENTS.md` + the unit's own `AGENTS.md`/`CLAUDE.md`.

Use `docs/INDEX.md` to find maintained documentation.

## 2. How to write a handover

A handover should be **pointers, commands, and traps** — not a prose dump.
The next session can read files itself; your job is to tell it exactly where to
look so it does not have to search. Paste `path:line` and symbol names, never
whole file contents.

Fixed sections, kept scannable:

1. **Task + status** — task id, spec path, commit SHA, is the tree clean,
   done / blocked.
2. **Objective** — one or two lines, link to the spec.
3. **Decisions locked** — each with rationale and where it was recorded.
4. **File map** — `path:line` for every touched symbol.
5. **Commands** — the exact gate commands and the last observed output
   (test counts, exit codes).
6. **Traps / deviations** — anything non-obvious or deliberately out of scope,
   so the next session does not "fix" it or repeat the mistake.
7. **Next move** — one concrete next step.

### Minimal template

```
Task: 21 — done, commit 72548fa6, tree clean
Spec: docs/tasks/task-21-slot-availability-endpoint.md
Decisions: min lead time 0 (docs/decisions-required.md)
Core files:
  backend/modules/Booking/Eloquent/Resolvers/Shared/ListSlotsEloquentResolver.php
  frontend/mobile/apps/client_app/lib/src/features/booking/branch_detail.bloc.dart:230 (_loadSlots)
Gates: php artisan test (696 passed); dart run melos run verify (exit 0)
Traps: PHPStan is repo-wide red pre-existing; config files carry no env() defaults
Next: Task 22 — must re-check the slot endpoint against hours/schedule
```

## 3. Repo fast-facts (pin these; they save hours)

- **Backend gate:** `cd backend && php artisan test`.
- **Mobile gate:** `cd frontend/mobile && dart run melos run verify`.
- **`melos` is not on PATH** — always `dart run melos run <script>`.
- **Use `flutter test`, not `dart test`** — `dart test` fails to load the
  suites.
- **Run `flutter test` from the app directory** (`frontend/mobile/apps/<app>`),
  not the workspace root; running from the root breaks asset/image loading in
  widget tests.
- **PHPStan is red repository-wide, independent of your change** (stale
  `phpstan-baseline.neon` + larastan/phpstan drift). Do not re-baseline.
  Check only your touched production paths:
  `vendor/bin/phpstan analyse --memory-limit=2G --debug <paths>`.
- **Backend config files have no `env()` defaults** (repo convention). Put any
  fallback in code, not in the `env()` call.
- **Backend backend structure:** feature modules under `backend/modules/`;
  each module loads its own config via `BaseModuleServiceProvider::loadConfig`;
  CQRS is Query -> Handler -> Eloquent Resolver; HTTP actions extend
  `BaseApiAction`; requests extend `BaseApiFormRequest`.
- **Mobile codegen:** DTOs via `dart run melos run build`; localization via
  `dart run melos run generate`. Never hand-write `fromJson`.
- **Mobile rules:** no relative imports; every user-visible string goes in both
  `app_en.arb` and `app_ar.arb` (real translation); one public class per file;
  bloc owns state, never navigates.
- **Read the task's "Out of Scope" list as hard constraints.** A behaviour that
  already exists elsewhere is the reason to keep it consistent, not to expand
  scope silently.

## 4. Make investigation powerful and fast

1. **Use the codebase knowledge graph, not grep.** Prefer the
   `codebase-memory-mcp` tools: `search_graph` to find symbols,
   `trace_path` for callers/callees, `get_code_snippet` to read a symbol.
   Index the repo once; persist the artifact so future sessions bootstrap
   without re-indexing.
2. **Read the `AGENTS.md` chain before editing** (root -> subsystem -> unit).
   It already encodes the rules that would otherwise be re-derived.
3. **Check for a `graphify-out/` graph** and treat architecture questions as
   graph queries if it exists.
4. **Record contradictions and deviations explicitly.** If a spec says one
   thing and the repo does another, write down which you followed and why, or
   the next session will "correct" it.
5. **Reconcile acceptance criteria against the domain model** before coding —
   call out any criterion that contradicts the authorization or data model.

## 5. Closing a task

- Confirm every acceptance criterion and every applicable gate with real
  command output. Never claim a gate passed without seeing it exit 0.
- Update the task checkbox in `docs/todowork.md` only after completion, and
  record resolved decisions in both `docs/decisions-required.md` and the task
  spec.
- Commit locally with a conventional message that includes the task number
  (e.g. `feat(booking): ... (Task 21)`). Never push, never use `--no-verify`,
  never stage unrelated work.
- Report the local commit SHA, the gates you ran, and any blocker.
