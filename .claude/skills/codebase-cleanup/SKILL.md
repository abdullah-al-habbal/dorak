---
name: codebase-cleanup
description: "Cleans the Dorak monorepo of regenerable leftovers: logs, caches, build and test output, IDE files and generated files in the backend, the dashboard and the three mobile apps. Use whenever the owner says 'clean up the codebase', 'cleanup', 'remove leftovers', 'remove generated files', 'clean logs', or at the end of a task for hygiene. Dry run first, then apply. Never deletes tracked files, work in progress, dependencies, environment files, secrets or uploads."
---

# Codebase cleanup

One procedure for every agent. "Clean up the codebase" always means exactly this, no more and no less.
It is generic: it discovers what to remove from Git's ignore rules, so new generated output is covered
without editing this skill.

## Rules

1. **Only ignored files.** Remove only what Git ignores (the script lists it with
   `git ls-files --others --ignored --exclude-standard`, file by file; never use `git clean -dX` directly,
   because it collapses a fully ignored directory into one entry and would delete the protected files inside
   it). Never remove tracked files, and never remove untracked files that are not ignored: those are the
   owner's or your work in progress.
2. **Protected, never removed:** `node_modules` and `vendor`; every `.env*` file; keystores, keys and
   service files (`*.jks`, `*.keystore`, `*.pem`, `key.properties`, `google-services.json`);
   `.husky/_` (the hooks stop working without it); the `public/storage` symlink; `.aiignore`; and
   `backend/storage/app/{public,private}` uploads, which can be development data. Changing this list needs the
   owner's explicit approval.
3. **No database, no Playwright, no Git writes.** Do not reset or touch any database, run Playwright, stage,
   commit, push or change remotes as part of a cleanup.
4. **Dry run first.** Run it without `--apply`, read the list, then apply. Nothing is deleted without the
   exact `--apply` flag; any other argument is rejected.
5. **After a failed gate, do not clean** until the failure is understood: logs and reports are the evidence.

## Procedure

```bash
bash .claude/skills/codebase-cleanup/scripts/cleanup-codebase.sh           # dry run: lists what would go
bash .claude/skills/codebase-cleanup/scripts/cleanup-codebase.sh --apply   # deletes it
```

What the apply step covers (discovered from Git's ignore rules, not hard-coded; the project clean commands
below run only when that part of the repo has something to remove):

- **Backend:** `storage/logs/*.log`, `storage/pail`, compiled views, framework and test caches,
  `bootstrap/cache` generated files, `public/hot`.
- **Dashboard:** `.next`, `tsconfig.tsbuildinfo`, `test-results`, reports, the Playwright auth state
  (`tests/e2e/.auth`, saved sessions); `npm run clean:artifacts` runs first; `next typegen` runs afterwards
  only if the cleanup removed the route types the typecheck needs (`next-env.d.ts`).
- **Mobile (client, stylist and business apps, shared packages):** `melos clean` (when `dart` is installed),
  `.dart_tool`, `build/`,
  IDE files (`.idea`, `*.iml`) and generated platform files (`local.properties`, the Gradle wrapper,
  `GeneratedPluginRegistrant.*`).

Verification status: the script's dry run was run in this repository, and its `--apply` mode was exercised
only in a throwaway Git repository (tracked, untracked, protected and removable files, a name with a space):
only the removable files went. It has not been run with `--apply` in this repository since the rewrite.

Afterwards:

1. Run `flutter pub get` in `frontend/mobile` (recreates `.dart_tool` and the generated platform files) before
   analyzing or building the apps.
2. Check `git status`: nothing may have changed except the removal of ignored files.
3. Report what was removed, what was kept and why, and that nothing was staged or committed.

## Related

- Hygiene policy: [Monorepo hygiene](../../../AGENTS.md).
- Task close-out step 8a in the [task executor](../monorepo-task-executor/SKILL.md) uses this skill.
