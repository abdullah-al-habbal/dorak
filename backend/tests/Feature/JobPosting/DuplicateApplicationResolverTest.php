<?php

declare(strict_types=1);

use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Artisan;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Schema;
use Illuminate\Support\Str;
use Modules\Barber\Models\BarberModel;
use Modules\BarberAffiliation\Enums\AffiliableType;
use Modules\BarberAffiliation\Enums\AffiliationInitiatorTypeEnum;
use Modules\BarberAffiliation\Enums\AffiliationStatus;
use Modules\BarberAffiliation\Models\BarberAffiliationModel;
use Modules\Branch\Models\BranchModel;
use Modules\Brand\Models\BrandModel;
use Modules\JobPosting\Models\ApplicationModel;
use Modules\JobPosting\Models\JobPostingModel;
use Modules\JobPosting\Support\DuplicateApplicationResolver;

/**
 * Approved rule for existing duplicate applications: keep Accepted > Seen > Submitted > Rejected, the oldest when
 * equal; archive the others with their full profile snapshot; never touch audit rows. The real table already has the
 * unique index, so the resolver runs on temporary copies (a temporary table needs no DDL commit and vanishes with the connection).
 */
const DUP_APPLICATIONS = 'dup_applications';
const DUP_ARCHIVE = 'dup_archive';
const DUP_POSTING = '11111111-1111-4111-8111-111111111111';
const DUP_BARBER = '22222222-2222-4222-8222-222222222222';

function dupWorkbench(): DuplicateApplicationResolver
{
    Schema::create(DUP_APPLICATIONS, function (Blueprint $table): void {
        $table->temporary();
        $table->uuid('id')->primary();
        $table->uuid('job_posting_id');
        $table->uuid('barber_id');
        $table->json('profile_snapshot');
        $table->string('status');
        $table->timestamp('created_at')->nullable();
        $table->timestamp('updated_at')->nullable();
    });
    Schema::create(DUP_ARCHIVE, function (Blueprint $table): void {
        $table->temporary();
        $table->uuid('id')->primary();
        $table->uuid('original_id')->unique();
        $table->uuid('kept_application_id');
        $table->uuid('job_posting_id');
        $table->uuid('barber_id');
        $table->string('status');
        $table->json('profile_snapshot');
        $table->timestamp('original_created_at')->nullable();
        $table->timestamp('original_updated_at')->nullable();
        $table->timestamp('archived_at')->useCurrent();
    });

    // Creating a table ends the harness's database transaction behind Laravel's back (its counter still says "open"):
    // reset the counter and open a real transaction again, so later writes to real tables are still rolled back.
    DB::rollBack(0);
    DB::beginTransaction();

    return new DuplicateApplicationResolver(DUP_APPLICATIONS, DUP_ARCHIVE);
}

/** @param  array<string, mixed>  $snapshot */
function dupApplication(string $id, string $status, string $createdAt, array $snapshot = [], string $posting = DUP_POSTING, string $barber = DUP_BARBER): void
{
    DB::table(DUP_APPLICATIONS)->insert([
        'id' => $id, 'job_posting_id' => $posting, 'barber_id' => $barber, 'status' => $status,
        'profile_snapshot' => json_encode($snapshot ?: ['note' => 'snapshot of '.$id]), 'created_at' => $createdAt, 'updated_at' => $createdAt,
    ]);
}

/** @return list<string> */
function dupRemainingIds(): array
{
    return DB::table(DUP_APPLICATIONS)->orderBy('id')->pluck('id')->all();
}

describe('Which application is kept', function (): void {
    it('keeps the highest status, whatever the order of creation', function (array $statuses, string $kept): void {
        $resolver = dupWorkbench();
        foreach ($statuses as $i => $status) {
            dupApplication('aaaaaaaa-0000-4000-8000-00000000000'.$i, $status, '2026-01-0'.($i + 1).' 10:00:00');
        }

        $resolver->resolve();

        expect(DB::table(DUP_APPLICATIONS)->value('status'))->toBe($kept)->and(DB::table(DUP_APPLICATIONS)->count())->toBe(1);
    })->with([
        'accepted beats everything' => [['rejected', 'submitted', 'seen', 'accepted'], 'accepted'],
        'accepted even when created last' => [['accepted', 'rejected', 'seen'], 'accepted'],
        'seen beats submitted and rejected' => [['rejected', 'submitted', 'seen'], 'seen'],
        'submitted beats rejected' => [['rejected', 'submitted'], 'submitted'],
        'a later rejection never beats an older submission' => [['submitted', 'rejected'], 'submitted'],
    ]);

    it('keeps the oldest of equal statuses, then the smallest id', function (): void {
        $resolver = dupWorkbench();
        dupApplication('bbbbbbbb-0000-4000-8000-000000000003', 'seen', '2026-03-01 10:00:00');
        dupApplication('bbbbbbbb-0000-4000-8000-000000000001', 'seen', '2026-02-01 10:00:00');
        dupApplication('bbbbbbbb-0000-4000-8000-000000000002', 'seen', '2026-02-01 10:00:00');

        $resolver->resolve();

        expect(dupRemainingIds())->toBe(['bbbbbbbb-0000-4000-8000-000000000001']);
    });

    it('ranks an unknown status below every real one', function (): void {
        $resolver = dupWorkbench();
        dupApplication('cccccccc-0000-4000-8000-000000000001', 'legacy-state', '2026-01-01 10:00:00');
        dupApplication('cccccccc-0000-4000-8000-000000000002', 'rejected', '2026-02-01 10:00:00');

        $resolver->resolve();

        expect(dupRemainingIds())->toBe(['cccccccc-0000-4000-8000-000000000002']);
    });
});

describe('Nothing is lost', function (): void {
    it('archives every removed application whole, with its own profile snapshot', function (): void {
        $resolver = dupWorkbench();
        dupApplication('dddddddd-0000-4000-8000-000000000001', 'accepted', '2026-01-01 10:00:00', ['name' => 'Keeper', 'photos' => [1, 2]]);
        dupApplication('dddddddd-0000-4000-8000-000000000002', 'submitted', '2026-01-02 10:00:00', ['name' => 'Second', 'skills' => ['fade']]);
        dupApplication('dddddddd-0000-4000-8000-000000000003', 'rejected', '2026-01-03 10:00:00', ['name' => 'Third', 'bio' => 'ar: مرحبا']);

        expect($resolver->resolve())->toBe(2);

        $archived = DB::table(DUP_ARCHIVE)->orderBy('original_id')->get();
        expect($archived)->toHaveCount(2)
            ->and($archived->pluck('original_id')->all())->toBe(['dddddddd-0000-4000-8000-000000000002', 'dddddddd-0000-4000-8000-000000000003'])
            ->and($archived->pluck('kept_application_id')->unique()->all())->toBe(['dddddddd-0000-4000-8000-000000000001'])
            ->and($archived->pluck('status')->all())->toBe(['submitted', 'rejected'])
            ->and(json_decode($archived[0]->profile_snapshot, true))->toEqual(['name' => 'Second', 'skills' => ['fade']])
            ->and(json_decode($archived[1]->profile_snapshot, true))->toEqual(['name' => 'Third', 'bio' => 'ar: مرحبا'])
            ->and($archived[0]->original_created_at)->toBe('2026-01-02 10:00:00');
        expect(json_decode((string) DB::table(DUP_APPLICATIONS)->value('profile_snapshot'), true))->toEqual(['name' => 'Keeper', 'photos' => [1, 2]]);
    });

    it('never touches audit rows, which keep pointing at the removed ids', function (): void {
        $resolver = dupWorkbench();
        dupApplication('eeeeeeee-0000-4000-8000-000000000001', 'accepted', '2026-01-01 10:00:00');
        dupApplication('eeeeeeee-0000-4000-8000-000000000002', 'rejected', '2026-01-02 10:00:00');
        foreach (['eeeeeeee-0000-4000-8000-000000000001', 'eeeeeeee-0000-4000-8000-000000000002'] as $id) {
            DB::table('status_change_logs')->insert(['id' => (string) Str::uuid(), 'subject_type' => 'job_application', 'subject_id' => $id, 'to_status' => 'seen', 'created_at' => '2026-01-05 10:00:00']);
        }
        $before = DB::table('status_change_logs')->orderBy('id')->get()->all();

        $resolver->resolve();

        expect(DB::table('status_change_logs')->orderBy('id')->get()->all())->toEqual($before);
        expect(DB::table(DUP_ARCHIVE)->where('original_id', 'eeeeeeee-0000-4000-8000-000000000002')->exists())->toBeTrue();
    });

    it('rolls everything back, archive copies included, when it fails after the delete', function (): void {
        $resolver = dupWorkbench();
        dupApplication('ffffffff-0000-4000-8000-000000000001', 'accepted', '2026-01-01 10:00:00');
        dupApplication('ffffffff-0000-4000-8000-000000000002', 'rejected', '2026-01-02 10:00:00');
        dupApplication('ffffffff-0000-4000-8000-000000000003', 'submitted', '2026-01-03 10:00:00');
        // The migration runs the resolver's transaction at top level (a real BEGIN/ROLLBACK), not as a savepoint
        // inside the harness transaction, so end the harness transaction first. Only temporary tables hold data here.
        while (DB::transactionLevel() > 0) {
            DB::commit();
        }
        $armed = true;
        // Fail right after the originals were deleted: the archive copies and the delete must both disappear.
        DB::listen(function ($query) use (&$armed): void {
            if ($armed && str_starts_with(strtolower($query->sql), 'delete from `'.DUP_APPLICATIONS.'`')) {
                throw new RuntimeException('simulated failure after the delete');
            }
        });

        try {
            expect(fn () => $resolver->resolve())->toThrow(RuntimeException::class, 'simulated failure');
            $armed = false;

            expect(DB::table(DUP_APPLICATIONS)->count())->toBe(3)->and(DB::table(DUP_ARCHIVE)->count())->toBe(0);
        } finally {
            $armed = false;
            Schema::dropIfExists(DUP_APPLICATIONS);
            Schema::dropIfExists(DUP_ARCHIVE);
        }
    });
});

it('leaves legacy brand-level affiliations exactly as they were (approved rule: preserve, never clean up)', function (): void {
    $resolver = dupWorkbench(); // first: creating tables ends the harness transaction, so nothing may be written before it
    $brand = BrandModel::factory()->create();
    $branch = BranchModel::factory()->create(['brand_id' => $brand->id]);
    foreach ([AffiliationStatus::Pending, AffiliationStatus::Active] as $status) {
        BarberAffiliationModel::factory()->create([
            'barber_id' => BarberModel::factory()->create()->id,
            'affiliable_id' => $brand->id,
            'affiliable_type' => AffiliableType::Brand,
            'initiated_by_type' => AffiliationInitiatorTypeEnum::Branch,
            'initiated_by_id' => $branch->id,
            'status' => $status,
            'accepted_at' => $status === AffiliationStatus::Active ? now() : null,
        ]);
    }
    $before = DB::table('barber_affiliations')->orderBy('id')->get()->all();
    dupApplication('77777777-0000-4000-8000-000000000001', 'seen', '2026-01-01 10:00:00');
    dupApplication('77777777-0000-4000-8000-000000000002', 'seen', '2026-01-02 10:00:00');

    $resolver->resolve();

    expect(DB::table('barber_affiliations')->orderBy('id')->get()->all())->toEqual($before)->and($before)->toHaveCount(2);
});

describe('Safe to repeat', function (): void {
    it('plans without changing anything and is a no-op once resolved', function (): void {
        $resolver = dupWorkbench();
        dupApplication('99999999-0000-4000-8000-000000000001', 'seen', '2026-01-01 10:00:00');
        dupApplication('99999999-0000-4000-8000-000000000002', 'seen', '2026-01-02 10:00:00');
        dupApplication('99999999-0000-4000-8000-000000000009', 'submitted', '2026-01-02 10:00:00', [], DUP_POSTING, '33333333-3333-4333-8333-333333333333');

        $plan = $resolver->plan();
        expect($plan)->toHaveCount(1)->and($plan[0]['keep']->id)->toBe('99999999-0000-4000-8000-000000000001')
            ->and(DB::table(DUP_APPLICATIONS)->count())->toBe(3)->and(DB::table(DUP_ARCHIVE)->count())->toBe(0);

        expect($resolver->resolve())->toBe(1)->and($resolver->resolve())->toBe(0)->and($resolver->plan())->toBe([]);
        expect(DB::table(DUP_APPLICATIONS)->count())->toBe(2)->and(DB::table(DUP_ARCHIVE)->count())->toBe(1);
    });

    it('is a dry run by default and only changes data with --apply', function (): void {
        $resolver = dupWorkbench();
        app()->instance(DuplicateApplicationResolver::class, $resolver);
        dupApplication('88888888-0000-4000-8000-000000000001', 'rejected', '2026-01-01 10:00:00');
        dupApplication('88888888-0000-4000-8000-000000000002', 'accepted', '2026-01-02 10:00:00');

        expect(Artisan::call('job-applications:resolve-duplicates'))->toBe(0);
        expect(Artisan::output())->toContain('Dry run')->and(DB::table(DUP_APPLICATIONS)->count())->toBe(2);

        expect(Artisan::call('job-applications:resolve-duplicates', ['--apply' => true]))->toBe(0);
        expect(Artisan::output())->toContain('Archived and removed 1')
            ->and(dupRemainingIds())->toBe(['88888888-0000-4000-8000-000000000002']);
    });
});

it('has the archive table and the unique index in the migrated schema', function (): void {
    expect(Schema::hasTable('job_application_duplicate_archives'))->toBeTrue()
        ->and(Schema::hasColumns('job_application_duplicate_archives', ['original_id', 'kept_application_id', 'profile_snapshot', 'status', 'original_created_at']))->toBeTrue()
        ->and(DB::table('job_application_duplicate_archives')->count())->toBe(0);
});

describe('Audit history survives removal', function (): void {
    /** Foreign keys that declare job_applications as their parent, or that sit on an audit or archive table. */
    function auditForeignKeys(): array
    {
        return DB::select(
            'select TABLE_NAME as owner, REFERENCED_TABLE_NAME as parent from information_schema.KEY_COLUMN_USAGE '
            .'where TABLE_SCHEMA = database() and REFERENCED_TABLE_NAME is not null '
            ."and (REFERENCED_TABLE_NAME = 'job_applications' or TABLE_NAME in ('status_change_logs', 'job_application_duplicate_archives'))"
        );
    }

    it('has no foreign key from the audit log or the archive to any table, so no delete can cascade into them', function (): void {
        expect(auditForeignKeys())->toBe([])
            ->and(DB::select("select 1 from information_schema.REFERENTIAL_CONSTRAINTS where CONSTRAINT_SCHEMA = database() and REFERENCED_TABLE_NAME = 'job_applications'"))->toBe([]);
    });

    it('keeps the audit rows of every archived duplicate, readable through the archive', function (): void {
        $resolver = dupWorkbench();
        $ids = ['91919191-0000-4000-8000-000000000001', '91919191-0000-4000-8000-000000000002', '91919191-0000-4000-8000-000000000003', '91919191-0000-4000-8000-000000000004'];
        dupApplication($ids[0], 'accepted', '2026-01-01 10:00:00');
        dupApplication($ids[1], 'submitted', '2026-01-02 10:00:00');
        dupApplication($ids[2], 'seen', '2026-01-03 10:00:00');
        dupApplication($ids[3], 'rejected', '2026-01-04 10:00:00');
        foreach ($ids as $n => $id) {
            foreach (['seen', 'accepted'] as $step => $to) {
                DB::table('status_change_logs')->insert(['id' => (string) Str::uuid(), 'subject_type' => 'job_application', 'subject_id' => $id, 'to_status' => $to, 'created_at' => '2026-01-1'.$n.' 1'.$step.':00:00']);
            }
        }
        $before = DB::table('status_change_logs')->whereIn('subject_id', $ids)->orderBy('id')->get()->all();

        expect($resolver->resolve())->toBe(3);

        expect(DB::table('status_change_logs')->whereIn('subject_id', $ids)->orderBy('id')->get()->all())->toEqual($before)->toHaveCount(8);
        $removed = array_slice($ids, 1);
        foreach ($removed as $id) {
            $history = DB::table('status_change_logs as l')
                ->join(DUP_ARCHIVE.' as a', 'a.original_id', '=', 'l.subject_id')
                ->where('l.subject_id', $id)->pluck('a.kept_application_id')->all();
            expect($history)->toBe([$ids[0], $ids[0]]);
        }
        expect(DB::table(DUP_APPLICATIONS)->whereIn('id', $removed)->count())->toBe(0);
    });

    it('keeps audit rows when the database itself deletes the application, directly or by cascade from its posting', function (): void {
        $posting = JobPostingModel::factory()->create();
        $barber = BarberModel::factory()->create();
        $other = BarberModel::factory()->create();
        $direct = ApplicationModel::factory()->create(['job_posting_id' => $posting->id, 'barber_id' => $barber->id]);
        $cascaded = ApplicationModel::factory()->create(['job_posting_id' => $posting->id, 'barber_id' => $other->id]);
        foreach ([$direct, $cascaded] as $application) {
            DB::table('status_change_logs')->insert(['id' => (string) Str::uuid(), 'subject_type' => 'job_application', 'subject_id' => $application->id, 'to_status' => 'seen', 'created_at' => '2026-01-05 10:00:00']);
        }

        DB::table('job_applications')->where('id', $direct->id)->delete();
        expect(DB::table('status_change_logs')->where('subject_id', $direct->id)->count())->toBe(1);

        // ON DELETE CASCADE from job_postings removes the remaining application row at the database level.
        DB::table('job_postings')->where('id', $posting->id)->delete();
        expect(DB::table('job_applications')->where('id', $cascaded->id)->exists())->toBeFalse()
            ->and(DB::table('status_change_logs')->where('subject_id', $cascaded->id)->count())->toBe(1);
    });

    it('keeps archive rows when the posting or barber they refer to is deleted', function (): void {
        $posting = JobPostingModel::factory()->create();
        $barber = BarberModel::factory()->create();
        DB::table('job_application_duplicate_archives')->insert([
            'id' => (string) Str::uuid(), 'original_id' => (string) Str::uuid(), 'kept_application_id' => (string) Str::uuid(),
            'job_posting_id' => $posting->id, 'barber_id' => $barber->id, 'status' => 'rejected', 'profile_snapshot' => '{"a":1}',
        ]);

        DB::table('job_postings')->where('id', $posting->id)->delete();
        DB::table('barbers')->where('id', $barber->id)->delete();

        expect(DB::table('job_application_duplicate_archives')->count())->toBe(1);
    });
});
