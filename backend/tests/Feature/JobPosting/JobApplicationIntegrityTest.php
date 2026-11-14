<?php

declare(strict_types=1);

use Illuminate\Database\UniqueConstraintViolationException;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Queue;
use Illuminate\Support\Facades\Schema;
use Modules\Barber\Models\BarberModel;
use Modules\JobPosting\Enums\ApplicationStatus;
use Modules\JobPosting\Enums\JobPostingStatusEnum;
use Modules\JobPosting\Jobs\JobApplicationReceivedNotification;
use Modules\JobPosting\Models\ApplicationModel;
use Modules\JobPosting\Models\JobPostingModel;
use Modules\JobPosting\Support\DuplicateApplicationScanner;

/**
 * Batch 1 (WP-1): one application per barber per posting, held by the database and by a locked,
 * transaction-safe apply. Limit: feature tests share one uncommitted transaction, so a live two-process
 * race is not run here (tests/Concurrency does); the race is simulated by a duplicate that lands between the check and the insert.
 */
function applicationIntegrityPosting(): JobPostingModel
{
    return JobPostingModel::factory()->create(['status' => JobPostingStatusEnum::Open]);
}

describe('One application per barber per posting', function (): void {
    beforeEach(function (): void {
        Queue::fake();
        $this->barber = BarberModel::factory()->create();
        $this->actingAs($this->barber, 'barber');
    });

    it('is enforced by the database', function (): void {
        $posting = applicationIntegrityPosting();
        ApplicationModel::factory()->create(['job_posting_id' => $posting->id, 'barber_id' => $this->barber->id]);

        expect(fn () => ApplicationModel::factory()->create(['job_posting_id' => $posting->id, 'barber_id' => $this->barber->id]))
            ->toThrow(UniqueConstraintViolationException::class);
        expect(ApplicationModel::query()->count())->toBe(1);
    });

    it('lets the same barber apply to a different posting and another barber to the same one', function (): void {
        $first = applicationIntegrityPosting();
        $second = applicationIntegrityPosting();
        ApplicationModel::factory()->create(['job_posting_id' => $first->id, 'barber_id' => $this->barber->id]);

        $this->postJson("/api/v1/jobs/{$second->id}/apply")->assertCreated();
        ApplicationModel::factory()->create(['job_posting_id' => $first->id, 'barber_id' => BarberModel::factory()->create()->id]);

        expect(ApplicationModel::query()->count())->toBe(3);
    });

    it('answers 422 to a second apply, keeps one row and queues one notice', function (): void {
        $posting = applicationIntegrityPosting();

        $this->postJson("/api/v1/jobs/{$posting->id}/apply")->assertCreated();
        $this->postJson("/api/v1/jobs/{$posting->id}/apply")->assertUnprocessable();

        expect(ApplicationModel::query()->where('job_posting_id', $posting->id)->count())->toBe(1);
        Queue::assertPushed(JobApplicationReceivedNotification::class, 1);
    });

    it('keeps a rejected barber from applying to the same posting again (approved rule)', function (): void {
        $posting = applicationIntegrityPosting();
        $rejected = ApplicationModel::factory()->create(['job_posting_id' => $posting->id, 'barber_id' => $this->barber->id, 'status' => ApplicationStatus::Rejected->value]);
        $before = (array) DB::table('job_applications')->where('id', $rejected->id)->first();
        $logsBefore = DB::table('status_change_logs')->count();

        $response = $this->postJson("/api/v1/jobs/{$posting->id}/apply")->assertUnprocessable();

        expect($response->json('message'))->toBe(__('jobposting::messages.already_applied'))
            ->and(DB::table('job_applications')->where('job_posting_id', $posting->id)->count())->toBe(1)
            ->and((array) DB::table('job_applications')->where('id', $rejected->id)->first())->toBe($before)
            ->and(DB::table('status_change_logs')->count())->toBe($logsBefore);
        Queue::assertNotPushed(JobApplicationReceivedNotification::class);

        // The rule is per posting: the same barber can still apply elsewhere, and another barber to this posting.
        $this->postJson('/api/v1/jobs/'.applicationIntegrityPosting()->id.'/apply')->assertCreated();
        $this->actingAs(BarberModel::factory()->create(), 'barber')->postJson("/api/v1/jobs/{$posting->id}/apply")->assertCreated();
    });

    it('turns a duplicate that slips past the check into already applied, keeps the original row and the transaction usable', function (): void {
        $posting = applicationIntegrityPosting();
        $original = ApplicationModel::factory()->create(['job_posting_id' => $posting->id, 'barber_id' => $this->barber->id, 'status' => ApplicationStatus::Seen->value]);
        // Blind the "already applied?" read, as if the other request committed after it ran: only the unique index is left to stop the insert.
        $blind = true;
        ApplicationModel::addGlobalScope('blind', function ($query) use (&$blind): void {
            if ($blind) {
                $query->whereRaw('1 = 0');
            }
        });

        $response = $this->postJson("/api/v1/jobs/{$posting->id}/apply")->assertUnprocessable();
        $blind = false;

        $rows = DB::table('job_applications')->where('job_posting_id', $posting->id)->where('barber_id', $this->barber->id)->get();
        expect($response->json('message'))->toBe(__('jobposting::messages.already_applied'))
            ->and($rows)->toHaveCount(1)
            ->and($rows[0]->id)->toBe($original->id)
            ->and($rows[0]->status)->toBe(ApplicationStatus::Seen->value)
            ->and(DB::table('job_applications')->count())->toBe(1)
            ->and(DB::transactionLevel())->toBe(1);
        Queue::assertNotPushed(JobApplicationReceivedNotification::class);

        $other = BarberModel::factory()->create();
        $this->actingAs($other, 'barber');
        $this->postJson("/api/v1/jobs/{$posting->id}/apply")->assertCreated();
        expect(DB::table('job_applications')->where('job_posting_id', $posting->id)->count())->toBe(2);
    });

    it('locks the posting row while applying (MySQL)', function (): void {
        $posting = applicationIntegrityPosting();
        $locked = [];
        DB::listen(function ($query) use (&$locked): void {
            if (str_contains(strtolower($query->sql), ' for update')) {
                $locked[] = $query->sql;
            }
        });

        $this->postJson("/api/v1/jobs/{$posting->id}/apply")->assertCreated();

        expect($locked)->toHaveCount(1)->and($locked[0])->toContain('`job_postings`');
    });
});

describe('The duplicate scan behind the migration', function (): void {
    it('reports each barber and posting pair that holds more than one row', function (): void {
        Schema::create('job_application_probe', function ($table): void {
            $table->temporary();
            $table->string('job_posting_id');
            $table->string('barber_id');
        });
        DB::table('job_application_probe')->insert([
            ['job_posting_id' => 'p1', 'barber_id' => 'b1'],
            ['job_posting_id' => 'p1', 'barber_id' => 'b1'],
            ['job_posting_id' => 'p1', 'barber_id' => 'b1'],
            ['job_posting_id' => 'p1', 'barber_id' => 'b2'],
            ['job_posting_id' => 'p2', 'barber_id' => 'b1'],
        ]);

        $duplicates = (new DuplicateApplicationScanner)->duplicates('job_application_probe');

        expect($duplicates)->toBe([['job_posting_id' => 'p1', 'barber_id' => 'b1', 'total' => 3]]);
    });

    it('finds nothing on a clean table', function (): void {
        ApplicationModel::factory()->count(3)->create();

        expect((new DuplicateApplicationScanner)->duplicates())->toBe([]);
    });
});

describe('The unique-index migration', function (): void {
    it('stops on existing duplicates, names the pairs and changes nothing', function (): void {
        Schema::create('job_application_probe', function ($table): void {
            $table->temporary();
            $table->string('job_posting_id');
            $table->string('barber_id');
        });
        DB::table('job_application_probe')->insert([
            ['job_posting_id' => 'p1', 'barber_id' => 'b1'],
            ['job_posting_id' => 'p1', 'barber_id' => 'b1'],
        ]);

        expect(fn () => (new DuplicateApplicationScanner)->ensureNone('job_application_probe'))
            ->toThrow(RuntimeException::class, 'Nothing was changed');
        expect(DB::table('job_application_probe')->count())->toBe(2);
    });

    it('passes on clean data', function (): void {
        ApplicationModel::factory()->count(2)->create();

        (new DuplicateApplicationScanner)->ensureNone();

        expect(true)->toBeTrue();
    });

    it('has put a unique index on exactly (job_posting_id, barber_id) in MySQL', function (): void {
        $columns = DB::table('information_schema.statistics')
            ->where('table_schema', DB::connection()->getDatabaseName())
            ->where('table_name', 'job_applications')
            ->where('index_name', 'job_applications_posting_barber_unique')
            ->orderBy('seq_in_index')
            ->get(['column_name as column_name', 'non_unique as non_unique']); // aliased: MySQL 8 returns information_schema labels in upper case

        expect($columns->pluck('column_name')->all())->toBe(['job_posting_id', 'barber_id'])
            ->and((int) $columns->first()->non_unique)->toBe(0);
    });
});
