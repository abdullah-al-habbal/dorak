<?php

declare(strict_types=1);

use Illuminate\Database\Connection;
use Illuminate\Database\QueryException;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Artisan;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Schema;
use Illuminate\Support\Str;
use Modules\Barber\Models\BarberModel;
use Modules\BarberAffiliation\Enums\AffiliationInitiatorTypeEnum;
use Modules\BarberAffiliation\Enums\AffiliationStatus;
use Modules\BarberAffiliation\Models\BarberAffiliationModel;
use Modules\Branch\Models\BranchModel;
use Modules\JobPosting\Enums\JobPostingStatusEnum;
use Modules\JobPosting\Models\JobPostingModel;
use Symfony\Component\Process\Process;

/**
 * Real two-connection concurrency (Batch 1 remediation, WP-1). Each request runs in its own PHP process with its
 * own MySQL session (tests/Support/concurrency-worker.php, which re-checks Tests\Support\TestDatabaseGuard), and the
 * test holds a third session to freeze the row the request needs.
 *
 * Two kinds of proof:
 *  - blocked-then-refused: a session holds `FOR UPDATE` on the row; the test waits until MySQL itself reports a
 *    waiting transaction (process list, polled until it shows the statement stuck), asserts the request is still running, then the
 *    holder commits a state change and the request must re-read it under the lock and refuse. Without the lock
 *    the request finishes instead of waiting and the test fails. No timing assumption is involved.
 *  - race: several requests start together and exactly one may win. A broken lock can pass by luck, a correct one
 *    never fails, so this proves the outcome rather than the lock.
 *
 * These tests COMMIT rows (the shared test transaction is closed first) into the single `dorak_test` database.
 * After every test the schema is rebuilt (`migrate:fresh`), so no committed row survives into the next test or
 * into the regular suite. They are in the `concurrency` group, excluded from the default run and run
 * sequentially: `composer test:concurrency` (which also resets `dorak_test` first).
 *
 * Limitation: the races (several simultaneous requests) are outcome proofs that a broken lock could still pass by
 * luck, because the unique index and the barber row lock also guard them. The apply race therefore has a second
 * variant that drops the unique index; the affiliation races cannot isolate the affiliation lock from the barber row
 * lock, so only the blocked-then-refused tests prove those locks themselves.
 */
function concurrencyCommitFixtures(): void
{
    // DDL ends the harness transaction on the server while Laravel's counter still says "open": just reset the counter.
    if (! DB::connection()->getPdo()->inTransaction()) {
        DB::rollBack(0);

        return;
    }

    while (DB::transactionLevel() > 0) {
        DB::commit();
    }
}

function concurrencyLocker(): Connection
{
    return DB::connectUsing('concurrency_locker', config('database.connections.mysql'), true);
}

/** @param  array<string, mixed>  $body */
function concurrencyStart(string $method, string $uri, string $token, array $body = []): Process
{
    $process = new Process(
        [PHP_BINARY, base_path('tests/Support/concurrency-worker.php'), $method, $uri, $token, $body === [] ? '' : json_encode($body, JSON_THROW_ON_ERROR)],
        base_path(),
        ['APP_ENV' => 'testing', 'DB_CONNECTION' => 'mysql', 'DB_DATABASE' => DB::connection()->getDatabaseName(), 'DB_URL' => ''],
    );
    $process->setTimeout(60);
    $process->start();

    return $process;
}

/** @return array{status: int, body: array<string, mixed>|null} */
function concurrencyFinish(Process $process): array
{
    $process->wait();
    $decoded = json_decode($process->getOutput(), true);

    expect($decoded)->toBeArray(sprintf("worker exit %s\n%s\n%s", $process->getExitCode(), $process->getOutput(), $process->getErrorOutput()));

    return $decoded;
}

/**
 * Other sessions currently executing a `FOR UPDATE` statement, read from the engine's process list. A point lookup
 * that is not blocked finishes in about a millisecond, so a session still executing one after a pause is waiting on
 * a lock. (The process list is the one signal that needs no extra privilege on MySQL 8.4.)
 */
function concurrencyBlockedStatements(): int
{
    return (int) DB::selectOne(
        "select count(*) as blocked from information_schema.processlist where id <> connection_id() and command in ('Query', 'Execute') and lower(info) like '%for update%'",
    )->blocked;
}

/** True when a statement was executing and is still executing 300 ms later: far longer than an unblocked lookup takes. */
function concurrencyStillBlocked(): bool
{
    if (concurrencyBlockedStatements() === 0) {
        return false;
    }
    usleep(300_000);

    return concurrencyBlockedStatements() > 0;
}

/** Waits for the engine to report a transaction waiting on a lock, then proves the request is that waiter and still running. */
function concurrencyAwaitBlocked(Process $process): void
{
    $deadline = microtime(true) + 30;
    while (! concurrencyStillBlocked()) {
        if (! $process->isRunning()) {
            throw new RuntimeException('The request finished without waiting on the lock held by another session: it does not lock the row. Output: '.$process->getOutput().$process->getErrorOutput());
        }
        if (microtime(true) > $deadline) {
            throw new RuntimeException('No transaction ever waited on the lock. Output: '.$process->getOutput().$process->getErrorOutput());
        }
        usleep(20_000);
    }

    expect($process->isRunning())->toBeTrue('The request must still be parked on the lock.');
}

afterEach(function (): void {
    while (DB::transactionLevel() > 0) {
        DB::commit();
    }
    DB::purge('concurrency_locker');
    Artisan::call('migrate:fresh', ['--force' => true]);
});

/** @return list<int> */
function concurrencyStatuses(array $results): array
{
    $codes = array_column($results, 'status');
    sort($codes);

    return $codes;
}

/** @return array{barber: BarberModel, branch: BranchModel, affiliation: BarberAffiliationModel, token: string} */
function concurrencyBranchRequest(): array
{
    $barber = BarberModel::factory()->create();
    $branch = BranchModel::factory()->create();
    $affiliation = BarberAffiliationModel::factory()->pending()->create([
        'barber_id' => $barber->id,
        'affiliable_id' => $branch->id,
        'initiated_by_type' => AffiliationInitiatorTypeEnum::Branch,
        'initiated_by_id' => $branch->id,
    ]);

    return ['barber' => $barber, 'branch' => $branch, 'affiliation' => $affiliation, 'token' => $barber->createToken('concurrency')->plainTextToken];
}

describe('A request that needs a locked row', function (): void {
    it('waits for the affiliation lock, then refuses an accept after the other session rejected it', function (): void {
        $world = concurrencyBranchRequest();
        concurrencyCommitFixtures();
        $locker = concurrencyLocker();
        $locker->beginTransaction();
        $locker->table('barber_affiliations')->where('id', $world['affiliation']->id)->lockForUpdate()->first();

        $accept = concurrencyStart('POST', "/api/v1/affiliations/{$world['affiliation']->id}/accept", $world['token']);
        try {
            concurrencyAwaitBlocked($accept);
            $locker->table('barber_affiliations')->where('id', $world['affiliation']->id)->update(['status' => AffiliationStatus::Rejected->value]);
            $locker->commit();
        } finally {
            if ($locker->transactionLevel() > 0) {
                $locker->rollBack();
            }
        }
        $result = concurrencyFinish($accept);

        $row = DB::table('barber_affiliations')->where('id', $world['affiliation']->id)->first();
        expect($result['status'])->toBe(400)
            ->and($row->status)->toBe(AffiliationStatus::Rejected->value)
            ->and($row->accepted_at)->toBeNull()
            ->and(DB::table('status_change_logs')->where('subject_id', $world['affiliation']->id)->count())->toBe(0);
    });

    it('waits for the affiliation lock, then refuses a branch accept after the other session rejected the request', function (): void {
        $barber = BarberModel::factory()->create();
        $branch = BranchModel::factory()->create();
        $affiliation = BarberAffiliationModel::factory()->pending()->create([
            'barber_id' => $barber->id,
            'affiliable_id' => $branch->id,
            'initiated_by_type' => AffiliationInitiatorTypeEnum::Barber,
            'initiated_by_id' => $barber->id,
        ]);
        $token = $branch->createToken('concurrency')->plainTextToken;
        concurrencyCommitFixtures();
        $locker = concurrencyLocker();
        $locker->beginTransaction();
        $locker->table('barber_affiliations')->where('id', $affiliation->id)->lockForUpdate()->first();

        $accept = concurrencyStart('POST', "/api/v1/branch/affiliations/{$affiliation->id}/accept", $token);
        try {
            concurrencyAwaitBlocked($accept);
            $locker->table('barber_affiliations')->where('id', $affiliation->id)->update(['status' => AffiliationStatus::Rejected->value]);
            $locker->commit();
        } finally {
            if ($locker->transactionLevel() > 0) {
                $locker->rollBack();
            }
        }
        $result = concurrencyFinish($accept);

        $row = DB::table('barber_affiliations')->where('id', $affiliation->id)->first();
        expect($result['status'])->toBe(400)->and($row->status)->toBe(AffiliationStatus::Rejected->value)->and($row->accepted_at)->toBeNull();
    });

    it('waits for the posting lock, then refuses an application after the other session closed the posting', function (): void {
        $barber = BarberModel::factory()->create();
        $posting = JobPostingModel::factory()->create(['status' => JobPostingStatusEnum::Open]);
        $token = $barber->createToken('concurrency')->plainTextToken;
        concurrencyCommitFixtures();
        $locker = concurrencyLocker();
        $locker->beginTransaction();
        $locker->table('job_postings')->where('id', $posting->id)->lockForUpdate()->first();

        $apply = concurrencyStart('POST', "/api/v1/jobs/{$posting->id}/apply", $token);
        try {
            concurrencyAwaitBlocked($apply);
            $locker->table('job_postings')->where('id', $posting->id)->update(['status' => JobPostingStatusEnum::Closed->value]);
            $locker->commit();
        } finally {
            if ($locker->transactionLevel() > 0) {
                $locker->rollBack();
            }
        }
        $result = concurrencyFinish($apply);

        expect($result['status'])->toBe(422)
            ->and(DB::table('job_applications')->where('job_posting_id', $posting->id)->count())->toBe(0);
    });
});

describe('The unique-index migration', function (): void {
    it('can be rolled back and applied again on MySQL', function (): void {
        $migration = require base_path('modules/JobPosting/Database/Migrations/2026_11_13_000001_add_unique_barber_per_posting_to_job_applications.php');
        concurrencyCommitFixtures();

        $migration->down();
        expect(Schema::hasIndex('job_applications', 'job_applications_posting_barber_unique'))->toBeFalse();

        $migration->up();
        expect(Schema::hasIndex('job_applications', 'job_applications_posting_barber_unique'))->toBeTrue();
    });
});

const DEPLOY_RESOLVE = '2026_11_12_000002_archive_and_remove_duplicate_job_applications';
const DEPLOY_INDEX_MIGRATION = '2026_11_13_000001_add_unique_barber_per_posting_to_job_applications';
const DEPLOY_INDEX = 'job_applications_posting_barber_unique';

/** The schema the previous release runs on: no unique index, the two contract migrations not yet recorded. */
function deployOldState(): void
{
    concurrencyCommitFixtures();
    (require base_path('modules/JobPosting/Database/Migrations/'.DEPLOY_INDEX_MIGRATION.'.php'))->down();
    DB::table('migrations')->whereIn('migration', [DEPLOY_RESOLVE, DEPLOY_INDEX_MIGRATION])->delete();
}

function deployMigrate(bool $deferred): string
{
    $deferred ? putenv('DEFER_CONTRACT_MIGRATIONS=1') : putenv('DEFER_CONTRACT_MIGRATIONS');
    try {
        Artisan::call('migrate', ['--force' => true]);
    } finally {
        putenv('DEFER_CONTRACT_MIGRATIONS');
    }

    return Artisan::output();
}

function deployRecorded(string $migration): bool
{
    return DB::table('migrations')->where('migration', $migration)->exists();
}

/** @return list<string> ids of the applications written by the "previous release" (no index, no lock). */
function deployWriteApplications(string $posting, string $barber, int $count): array
{
    $ids = [];
    foreach (range(1, $count) as $n) {
        $ids[] = $id = (string) Str::uuid();
        DB::table('job_applications')->insert([
            'id' => $id, 'job_posting_id' => $posting, 'barber_id' => $barber, 'status' => 'submitted',
            'profile_snapshot' => json_encode(['n' => $n]), 'created_at' => '2026-02-0'.$n.' 10:00:00', 'updated_at' => '2026-02-0'.$n.' 10:00:00',
        ]);
    }

    return $ids;
}

describe('The deploy migration sequence', function (): void {
    beforeEach(function (): void {
        $this->barber = BarberModel::factory()->create();
        $this->posting = JobPostingModel::factory()->create(['status' => JobPostingStatusEnum::Open]);
    });

    it('pre-swap pass defers resolution and index unrecorded; the previous release can still create duplicates; the post-swap pass fixes them all', function (): void {
        deployOldState();
        $firstDuplicates = deployWriteApplications($this->posting->id, $this->barber->id, 2);

        $output = deployMigrate(deferred: true);

        // Pre-swap: nothing destructive ran, both contract migrations are visible as skipped and are not recorded.
        expect($output)->toContain(DEPLOY_RESOLVE)->toContain('SKIPPED')
            ->and(deployRecorded(DEPLOY_RESOLVE))->toBeFalse()
            ->and(deployRecorded(DEPLOY_INDEX_MIGRATION))->toBeFalse()
            ->and(Schema::hasIndex('job_applications', DEPLOY_INDEX))->toBeFalse()
            ->and(DB::table('job_applications')->count())->toBe(2)
            ->and(DB::table('job_application_duplicate_archives')->count())->toBe(0);

        // The window: the previous release has no index and no lock, so it may still write another duplicate.
        $lateDuplicate = deployWriteApplications($this->posting->id, $this->barber->id, 1);
        expect(DB::table('job_applications')->count())->toBe(3);

        // Post-swap: resolution runs immediately before the index, so the late duplicate is handled too.
        deployMigrate(deferred: false);

        expect(DB::table('job_applications')->count())->toBe(1)
            ->and(DB::table('job_application_duplicate_archives')->count())->toBe(2)
            ->and(Schema::hasIndex('job_applications', DEPLOY_INDEX))->toBeTrue()
            ->and(deployRecorded(DEPLOY_RESOLVE))->toBeTrue()
            ->and(deployRecorded(DEPLOY_INDEX_MIGRATION))->toBeTrue()
            ->and(Artisan::call('job-applications:verify-unique-index'))->toBe(0);
        expect(DB::table('job_application_duplicate_archives')->pluck('original_id')->sort()->values()->all())
            ->toBe(collect([...$firstDuplicates, ...$lateDuplicate])->diff(DB::table('job_applications')->pluck('id'))->sort()->values()->all());
    });

    it('reports pending migrations while the deferral is in force, so the deploy cannot mistake it for done', function (): void {
        deployOldState();
        deployMigrate(deferred: true);

        Artisan::call('migrate:status', ['--pending' => true, '--no-ansi' => true]);

        expect(Artisan::output())->not->toContain('No pending migrations')->toContain(DEPLOY_INDEX_MIGRATION);
        expect(Artisan::call('job-applications:verify-unique-index'))->toBe(1);
    });

    it('rolls the data step back and records nothing when it fails, then succeeds once the cause is fixed', function (): void {
        deployOldState();
        deployWriteApplications($this->posting->id, $this->barber->id, 2);
        Schema::rename('job_application_duplicate_archives', 'archive_parked');

        expect(fn () => deployMigrate(deferred: false))->toThrow(QueryException::class);

        concurrencyCommitFixtures();
        expect(DB::table('job_applications')->count())->toBe(2)
            ->and(Schema::hasIndex('job_applications', DEPLOY_INDEX))->toBeFalse()
            ->and(deployRecorded(DEPLOY_RESOLVE))->toBeFalse()
            ->and(deployRecorded(DEPLOY_INDEX_MIGRATION))->toBeFalse()
            ->and(Artisan::call('job-applications:verify-unique-index'))->toBe(1);

        Schema::rename('archive_parked', 'job_application_duplicate_archives');
        deployMigrate(deferred: false);

        expect(DB::table('job_applications')->count())->toBe(1)
            ->and(Schema::hasIndex('job_applications', DEPLOY_INDEX))->toBeTrue()
            ->and(Artisan::call('job-applications:verify-unique-index'))->toBe(0);
    });

    it('resolves a duplicate that exists when the index step starts, so a recorded resolution cannot leave the deploy stuck', function (): void {
        deployOldState();
        // The resolution migration is recorded as done, then a duplicate appears before the index (previous release in flight).
        DB::table('migrations')->insert(['migration' => DEPLOY_RESOLVE, 'batch' => 99]);
        deployWriteApplications($this->posting->id, $this->barber->id, 2);

        deployMigrate(deferred: false);

        expect(deployRecorded(DEPLOY_INDEX_MIGRATION))->toBeTrue()
            ->and(Schema::hasIndex('job_applications', DEPLOY_INDEX))->toBeTrue()
            ->and(DB::table('job_applications')->count())->toBe(1)
            ->and(DB::table('job_application_duplicate_archives')->count())->toBe(1)
            ->and(Artisan::call('job-applications:verify-unique-index'))->toBe(0);
    });

    it('survives a duplicate written between the resolution and the index build: the build fails atomically and the next attempt resolves it', function (): void {
        deployOldState();
        deployWriteApplications($this->posting->id, $this->barber->id, 2);
        $injected = [];
        DB::beforeExecuting(function (string $query) use (&$injected): void {
            if ($injected === [] && str_starts_with(strtolower($query), 'alter table `job_applications` add unique')) {
                $injected = deployWriteApplications($this->posting->id, $this->barber->id, 1);
            }
        });

        deployMigrate(deferred: false);

        expect($injected)->toHaveCount(1)
            ->and(Schema::hasIndex('job_applications', DEPLOY_INDEX))->toBeTrue()
            ->and(DB::table('job_applications')->count())->toBe(1)
            ->and(DB::table('job_application_duplicate_archives')->count())->toBe(2)
            ->and(deployRecorded(DEPLOY_INDEX_MIGRATION))->toBeTrue();
    });

    it('archives the status a concurrent accept committed while the resolution was waiting for the row lock', function (): void {
        deployOldState();
        [$older, $newer] = deployWriteApplications($this->posting->id, $this->barber->id, 2);
        concurrencyCommitFixtures();
        $locker = concurrencyLocker();
        $locker->beginTransaction();
        $locker->table('job_applications')->where('id', $newer)->lockForUpdate()->first();

        $resolve = new Process(
            [PHP_BINARY, base_path('artisan'), 'job-applications:resolve-duplicates', '--apply'],
            base_path(),
            ['APP_ENV' => 'testing', 'DB_CONNECTION' => 'mysql', 'DB_DATABASE' => DB::connection()->getDatabaseName(), 'DB_URL' => ''],
        );
        $resolve->setTimeout(60);
        $resolve->start();
        try {
            concurrencyAwaitBlocked($resolve);
            // Without a locking read the resolution would keep the older "submitted" row and delete this accepted one.
            $locker->table('job_applications')->where('id', $newer)->update(['status' => 'accepted']);
            $locker->commit();
        } finally {
            if ($locker->transactionLevel() > 0) {
                $locker->rollBack();
            }
        }
        $resolve->wait();

        expect($resolve->getExitCode())->toBe(0, $resolve->getOutput().$resolve->getErrorOutput())
            ->and(DB::table('job_applications')->pluck('status', 'id')->all())->toBe([$newer => 'accepted'])
            ->and(DB::table('job_application_duplicate_archives')->where('original_id', $older)->value('status'))->toBe('submitted');
    });

    it('is a no-op on an already migrated database and when nothing is deferred', function (): void {
        concurrencyCommitFixtures();

        expect(deployMigrate(deferred: true))->toContain('Nothing to migrate')
            ->and(deployMigrate(deferred: false))->toContain('Nothing to migrate')
            ->and(Artisan::call('job-applications:verify-unique-index'))->toBe(0);
    });
});

describe('Parallel requests', function (): void {
    it('lets one of five simultaneous applications by the same barber win and refuses the rest', function (): void {
        $barber = BarberModel::factory()->create();
        $posting = JobPostingModel::factory()->create(['status' => JobPostingStatusEnum::Open]);
        $token = $barber->createToken('concurrency')->plainTextToken;
        concurrencyCommitFixtures();

        $workers = array_map(fn () => concurrencyStart('POST', "/api/v1/jobs/{$posting->id}/apply", $token), range(1, 5));
        $results = array_map('concurrencyFinish', $workers);

        expect(concurrencyStatuses($results))->toBe([201, 422, 422, 422, 422])
            ->and(DB::table('job_applications')->where('job_posting_id', $posting->id)->where('barber_id', $barber->id)->count())->toBe(1);
    });

    it('lets one of five simultaneous applications win on the posting lock alone, with the unique index dropped', function (): void {
        // Without the index only the posting row lock and the "already applied?" check can stop a duplicate, so this
        // outcome cannot be explained by the index. (The schema is rebuilt after every test.)
        // MySQL keeps an index on job_posting_id for the foreign key, so give it a plain one before the unique goes.
        Schema::table('job_applications', function (Blueprint $table): void {
            $table->index('job_posting_id', 'job_applications_job_posting_id_index');
            $table->dropUnique('job_applications_posting_barber_unique');
        });
        $barber = BarberModel::factory()->create();
        $posting = JobPostingModel::factory()->create(['status' => JobPostingStatusEnum::Open]);
        $token = $barber->createToken('concurrency')->plainTextToken;
        concurrencyCommitFixtures();

        $workers = array_map(fn () => concurrencyStart('POST', "/api/v1/jobs/{$posting->id}/apply", $token), range(1, 5));
        $results = array_map('concurrencyFinish', $workers);

        expect(Schema::hasIndex('job_applications', 'job_applications_posting_barber_unique'))->toBeFalse()
            ->and(concurrencyStatuses($results))->toBe([201, 422, 422, 422, 422])
            ->and(DB::table('job_applications')->where('job_posting_id', $posting->id)->where('barber_id', $barber->id)->count())->toBe(1);
    });

    it('lets one of two simultaneous accepts of the same request win', function (): void {
        $world = concurrencyBranchRequest();
        concurrencyCommitFixtures();

        $workers = array_map(fn () => concurrencyStart('POST', "/api/v1/affiliations/{$world['affiliation']->id}/accept", $world['token']), range(1, 2));
        $results = array_map('concurrencyFinish', $workers);

        $row = DB::table('barber_affiliations')->where('id', $world['affiliation']->id)->first();
        expect(concurrencyStatuses($results))->toBe([200, 400])
            ->and($row->status)->toBe(AffiliationStatus::Active->value)
            ->and(DB::table('status_change_logs')->where('subject_id', $world['affiliation']->id)->count())->toBe(1);
    });

    it('lets one of a branch accept and a branch reject of the same barber request win and the row follow the winner', function (): void {
        $barber = BarberModel::factory()->create();
        $branch = BranchModel::factory()->create();
        $affiliation = BarberAffiliationModel::factory()->pending()->create([
            'barber_id' => $barber->id,
            'affiliable_id' => $branch->id,
            'initiated_by_type' => AffiliationInitiatorTypeEnum::Barber,
            'initiated_by_id' => $barber->id,
        ]);
        $token = $branch->createToken('concurrency')->plainTextToken;
        concurrencyCommitFixtures();

        $workers = [
            'accept' => concurrencyStart('POST', "/api/v1/branch/affiliations/{$affiliation->id}/accept", $token),
            'reject' => concurrencyStart('POST', "/api/v1/branch/affiliations/{$affiliation->id}/reject", $token),
        ];
        $results = array_map('concurrencyFinish', $workers);

        $winner = $results['accept']['status'] === 200 ? 'accept' : 'reject';
        expect(concurrencyStatuses($results))->toBe([200, 400])
            ->and(DB::table('barber_affiliations')->where('id', $affiliation->id)->value('status'))
            ->toBe($winner === 'accept' ? AffiliationStatus::Active->value : AffiliationStatus::Rejected->value);
    });
});
