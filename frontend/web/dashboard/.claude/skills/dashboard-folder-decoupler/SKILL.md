---
name: dashboard-folder-decoupler
description: Splits a flat dashboard src/ folder (hooks, lib, types, interfaces, schemas, enums, config, services/api/query|mutation) into domain subfolders with zero behaviour change. Use for "decouple", "hierarchize" or "split the X folder" requests in frontend/web/dashboard.
---

# Dashboard folder decoupler

Moves files into domain subfolders and rewrites every `@/` import, with no logic change.
Safe because the repo bans relative imports and barrels: every reference is an exact quoted
`@/…` string, so the rewrite is a deterministic string replace.

Run from `frontend/web/dashboard`. One layer × one batch per commit.

## Frozen (never move)

`src/app/**`, `src/components/ui/**`, `src/locales/**`, `src/proxy.ts`,
`src/services/api/{proxy,core,auth,public}/**`, `config/proxy-allow-list.constant.ts`,
`config/routes.constant.ts`, `config/auth-actors.constant.ts`, `lib/utils.ts` (shadcn),
`lib/{api-response,parse-guard,query-client}.ts`. Files with fan-in over 40 need `--allow-core`.

## Workflow

0. **Preconditions.** `git status` clean for dashboard files (never touch unrelated edits).
   Stop `next dev`. `npx next typegen`. Baseline `npm run typecheck && npm run lint && npm test`
   must be green; if not, report it and stop (do not fix unrelated failures).
1. **Plan (no writes).** `node .claude/skills/dashboard-folder-decoupler/scripts/plan-moves.mjs <map.json> > $SCRATCH/moves.json`.
   Refuses existing targets and frozen files. It also lists the mirrored `tests/` moves.
   Ask the user before applying more than 25 files (a density split of an over-10 folder is the exception).
2. **Apply.** `node …/apply-moves.mjs $SCRATCH/moves.json` runs `git mv`, then rewrites
   quoted specifiers in `src/`, `tests/`, `vitest.config.mts`, `playwright.config.ts` and docs.
   Then fix by hand: `import.meta.glob(...)` patterns and any path in docs prose (the script reports them).
3. **Verify, in order, all must pass:**
   1. `node …/verify-imports.mjs $SCRATCH/moves.json` (every `@/` resolves, no old path left,
      no relative import, no barrel, no src folder over 10 files, see Density gate; `import.meta.glob` patterns are checked by the tests that use them).
   2. `bash ../../../.claude/skills/monorepo-task-executor/scripts/check-conventions.sh`
   3. `npm run typecheck`, `npm run lint`, `npm test` (test count must equal the baseline), `npm run build`.
   4. `TZ=UTC npx playwright test` only if `app/`, `services/api/proxy` or the allow-list changed (they must not).
4. **Docs.** Run `node …/rewrite-docs.mjs $SCRATCH/moves.json` for path mentions in markdown, then update `src/README.md` (layer rows) and any `codeanchors` that named a moved path.
5. **Commit locally**, stage only moved files, mirrored tests and doc edits:
   `refactor(dashboard): group <layer> by domain (Task N)`. Never push, never `--no-verify`.
   On any gate failure revert the batch (`git restore --staged --worktree` on the moved paths) and report the output.

## Density gate (permanent)

Every `src/` folder holds **at most 10 direct files**. Fewer is fine; do not merge small folders.
A folder over 10 is split into cohesive sub-folders (each 10 or fewer) in the same commit that grew it.
Exempt (frozen/vendored): `app/`, `components/ui/**`, `locales/**`, `services/api/auth`.
Enforced by `scripts/density.sh [max=10]` (exit 1 on any offender) and by `verify-imports.mjs` (walks all of `src/`).
Frozen files stay at their path: for example `config/routes.constant.ts` stays at the `config/` root.

Rules: no renames, splits or merges in a move commit. No `index.ts`. Domain names come from
`references/domain-map.md`; only the owner changes that map.

See `references/layer-rules.md` and `references/domain-map.md`. Helpers: `scripts/density.sh` (gate).
