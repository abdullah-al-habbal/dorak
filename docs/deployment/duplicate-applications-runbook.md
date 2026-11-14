# Runbook: duplicate job applications and the unique-index migration

Status: **approved and implemented (2026-11-14).** The rules are recorded in
[decisions-required.md](../decisions-required.md) ("Duplicate application cleanup", "Migration strategy for the
unique index"). The procedure below is safe to repeat. No production data is known to exist
(see "Production status" there), so today every step is a no-op; it is kept for the first deploy to a database that
holds data.

## The rule

For each (posting, barber) pair with more than one application, keep:

1. the highest status: `accepted` > `seen` > `submitted` > `rejected` (an unknown status ranks lowest);
2. when the status is equal, the oldest `created_at`;
3. when that is equal too, the smallest id.

Every other row is **archived, then removed**:

- the whole row, including its own `profile_snapshot`, is copied to `job_application_duplicate_archives`
  (`original_id`, `kept_application_id`, `status`, `profile_snapshot`, original timestamps);
- the copy is read back and compared with the original (snapshot, status, kept id);
- only then are the originals deleted by primary key, and the result is verified (one row per pair, every kept row present);
- all of it runs in one transaction, and every read in it is a locking read (`FOR UPDATE`): the status that is archived is
  the latest committed one (an accept that commits while the resolution waits is not lost) and writers wait until the
  transaction ends. Any failure leaves the data exactly as it was.

Audit history is preserved: `status_change_logs` rows are never touched. They keep pointing at the removed ids, which
stay resolvable in the archive table. Neither `status_change_logs` nor the archive has any foreign key (verified in
`information_schema`; `job_applications` is referenced by no table), so no `ON DELETE CASCADE` can reach them, not even when a
posting or barber is deleted. Legacy brand-level affiliation rows are never touched either.

## What the deploy does (exact order in `deploy.yml`)

1. Clone the commit, link the shared `.env` and storage, `composer install`. The EXIT trap `cleanup_failed_release` is armed.
2. **Pre-swap pass:** `DEFER_CONTRACT_MIGRATIONS=1 flock … artisan migrate --force` (the previous release is still serving).
3. **Atomic swap** (`mv` release into place), `config:cache`, `route:cache`, `view:cache`, `artisan about`.
4. **HTTP health check** against the new release (`/api/v1/health`).
5. **Maintenance mode and drain:** `artisan down` writes the maintenance file into the *shared* storage, so every release,
   the previous one included, answers 503 to new requests. `artisan queue:restart` makes workers exit after their
   current job and boot the new code. The deploy then waits `DORAK_DRAIN_SECONDS` (45) so requests of the previous
   release that were executing at the swap can finish.
6. **Post-swap pass:** `env -u DEFER_CONTRACT_MIGRATIONS flock … artisan migrate --force`, then
   `artisan job-applications:verify-unique-index` (index exists, no duplicate) and `artisan migrate:status --pending`
   (must say "No pending migrations"). Any failure exits non-zero; the trap restores the previous release and lifts
   maintenance mode.
7. `artisan up`, then a **second HTTP health check** against the final schema (index present).
8. Disarm the trap ("Deployment is now committed"), promote the previous release to `_old`, prune old releases.

| Migration | Kind | Pass |
|---|---|---|
| `2026_11_12_000001_create_job_application_duplicate_archives_table` | expand | pre-swap: creates an empty archive table |
| `2026_11_12_000002_archive_and_remove_duplicate_job_applications` | data (archived first) | **post-swap**: applies the rule above; no-op without duplicates |
| `2026_11_13_000001_add_unique_barber_per_posting_to_job_applications` | contract | **post-swap**: resolves again and builds the index as one unit (up to 3 attempts), then checks the index exists before it can be recorded |

During the pre-swap pass `DEFER_CONTRACT_MIGRATIONS=1` makes `shouldRun()` return false for the last two: Laravel prints
`SKIPPED` and does **not** record them. The variable is read from the process environment only (not `.env`, not config),
is set inline on that one command, and is explicitly unset for the post-swap command, so it cannot stay in force. A
skipped migration stays pending, so any later plain `migrate` runs it; step 6 fails the deploy if one is still pending.
Without the variable (tests, local development, a manual `migrate`) everything runs in order.

## Compatibility window

The previous release checks "already applied?" and then inserts, with no lock and no handling of a unique violation.
The swap does not stop its requests that are already executing, nor a long-running queue worker. Three layers cover that:

- **Availability:** the index is built only after the swap (with it, the previous release's concurrent double submit
  would answer HTTP 500), and only in maintenance mode after the drain wait, so no new request of any release writes.
- **Data safety:** the resolution takes row locks, so a writer that is still executing waits instead of interleaving. The
  unique index is the final guard: a duplicate that still arrives between the resolution and the index build makes the
  build fail atomically (nothing is created, nothing is lost).
- **Recoverability:** resolution and index are one unit (`UniqueApplicationIndexInstaller`, 3 attempts). The failed build
  is followed by a new resolution, so a late duplicate cannot leave the deploy stuck behind an already-recorded resolution.
  After the last attempt the migration is not recorded and the deploy fails with the data intact.

The new release locks the posting row, re-checks, and maps a unique violation to 422 `already_applied`, so it creates no
duplicates with or without the index (concurrency tests: "one of five wins on the posting lock alone, with the unique
index dropped" and the same with the index). The posting lock does **not** protect against code of the previous release:
that is what maintenance mode, the drain and the index are for.

## Failure behaviour

| Failure | Result |
|---|---|
| Pre-swap pass fails | Trap removes the incomplete release; previous release keeps serving. Pre-swap work is only the archive table. |
| Post-swap resolution fails (e.g. archive write) | Its transaction rolls back (no row removed, no archive row kept), nothing is recorded, deploy exits non-zero, trap restores the previous release and lifts maintenance mode. |
| A duplicate appears before the index build | The build fails atomically, the next attempt resolves the duplicate and builds again. Only after 3 failed attempts does the migration fail unrecorded (deploy fails, previous release restored). |
| Index build fails or is missing afterwards | `up()` throws before the migration can be recorded; `verify-unique-index` fails the deploy. |
| Deploy fails **after** the index exists (verify, pending check, second health check) | The previous release is restored **on a schema that has the index**. It still works; only a concurrent double submit by one barber answers HTTP 500 there (the index refuses the second row). No data is lost. Roll forward; do not drop the index to appease old code. |
| Deploy lock held by another run | `flock -E 99`: exit 99, nothing runs. |

Maintenance mode is a file in shared storage; the trap removes it on every exit, so a failed deploy cannot leave the
site answering 503. The restored release otherwise runs on a schema it supports. Schema changes are never rolled back
(see "Rollback").

## Procedure

1. **Back up** `job_applications` and `status_change_logs` (snapshot or `mysqldump`), and note the row count:
   `SELECT COUNT(*) FROM job_applications;`
2. **Preview** (read-only, changes nothing): `php artisan job-applications:resolve-duplicates`.
   It lists each pair, the row it keeps, and the rows it would archive. No output beyond "No duplicate applications."
   means there is nothing to do.
3. **Deploy.** The migrations apply the rule. Alternatively run `php artisan job-applications:resolve-duplicates --apply`
   first (same code, same rule), then deploy. If a deploy still fails on the index, run the same command, then deploy again.
4. **Verify** after the deploy (`artisan job-applications:verify-unique-index` already did the first and third check):
   ```sql
   SELECT job_posting_id, barber_id, COUNT(*) FROM job_applications GROUP BY 1, 2 HAVING COUNT(*) > 1;  -- 0 rows
   SELECT COUNT(*) FROM job_application_duplicate_archives;                                           -- rows removed
   SHOW INDEX FROM job_applications WHERE Key_name = 'job_applications_posting_barber_unique';        -- 2 rows, Non_unique = 0
   ```
   Archived plus remaining rows equals the count from step 1.
5. **Recover** a removed application if ever needed: its full row is in the archive table under `original_id`.

## Rollback

`migrate:rollback` is not part of the recovery path (see `backend/docs/16-deployment-operations-part-5.md`): application
rollback is not database rollback. The index migration's `down()` works on MySQL (it adds a plain `job_posting_id` index
before dropping the unique one); the archive migration's `down()` is empty on purpose, so removed rows are never lost.

## Tests

`tests/Feature/JobPosting/DuplicateApplicationResolverTest.php` covers precedence, the oldest-wins tie-break, snapshot
preservation, untouched audit rows and legacy affiliations, rollback on failure, idempotence and the dry-run default;
`tests/Concurrency` (MySQL) covers the index migration's down/up and the deploy sequence: both contract migrations SKIPPED
and unrecorded while deferred, a duplicate written by the "previous release" in the window, the post-swap pass resolving
and indexing, a failing resolution, a duplicate arriving before the index, pending detection and the no-op rerun.
`tests/Unit/Deployment/DeployWorkflowSequenceTest.php` pins the real `deploy.yml` order, parses it with `bash -n` and runs
its rollback trap against temporary directories (maintenance mode is lifted on failure). `MigrationGuardTest` covers the migration guard, including the monorepo layout, uncommitted edits and `--require-base`.
