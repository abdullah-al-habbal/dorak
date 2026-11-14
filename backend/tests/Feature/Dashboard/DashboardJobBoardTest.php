<?php

declare(strict_types=1);

use Illuminate\Support\Facades\Queue;
use Modules\Admin\Models\AdminModel;
use Modules\Barber\Models\BarberModel;
use Modules\Branch\Models\BranchModel;
use Modules\Brand\Constants\BrandFeatureConstants;
use Modules\Brand\Models\BrandModel;
use Modules\Brand\Services\BrandFeatures;
use Modules\Client\Models\ClientModel;
use Modules\JobPosting\Enums\ApplicationStatus;
use Modules\JobPosting\Enums\JobPostingStatusEnum;
use Modules\JobPosting\Enums\JobPostingTypeEnum;
use Modules\JobPosting\Jobs\JobApplicationStatusChangedNotification;
use Modules\JobPosting\Models\ApplicationModel;
use Modules\JobPosting\Models\JobPostingModel;

const JOB_BOARD_URL = '/api/v1/dashboard/branches';

function jobBoardSwitchTo(AdminModel|BarberModel|BranchModel|ClientModel $actor): void
{
    app('auth')->forgetGuards();
    test()->flushHeaders();
    test()->authenticateDashboardActor($actor);
}

/** @return array{owner: ClientModel, brand: BrandModel, branch: BranchModel} a brand whose job board is on */
function jobBoardWorld(): array
{
    $owner = ClientModel::factory()->create();
    $brand = BrandModel::factory()->create(['owner_id' => $owner->id]);
    app(BrandFeatures::class)->set($brand, [BrandFeatureConstants::BRAND_FEATURE_JOB_BOARD => true]);

    return ['owner' => $owner, 'brand' => $brand, 'branch' => BranchModel::factory()->create(['brand_id' => $brand->id])];
}

function jobBoardPayload(array $overrides = []): array
{
    return [
        'title' => ['en' => 'Senior barber', 'ar' => 'حلاق أول'],
        'description' => ['en' => 'Fades and beards', 'ar' => 'حلاقة ولحى'],
        ...$overrides,
    ];
}

/** NS-17: the shop team's job board. Admin refusals and mark-seen are pinned in DashboardSecurityHardeningTest. */
describe('Create a job posting (NS-17)', function (): void {
    it('stores an open posting for the branch with both languages and the optional fields', function (): void {
        $world = jobBoardWorld();
        $this->authenticateDashboardActor($world['branch']);

        $response = $this->postJson(JOB_BOARD_URL."/{$world['branch']->id}/job-postings", jobBoardPayload([
            'requirements' => ['en' => '3 years', 'ar' => '٣ سنوات'],
            'location' => 'Amman',
            'employment_type' => JobPostingTypeEnum::PartTime->value,
        ]))
            ->assertCreated()
            ->assertJsonPath('data.status', 'open')
            ->assertJsonPath('data.applications_count', 0)
            ->assertJsonPath('data.title.ar', 'حلاق أول')
            ->assertJsonPath('data.employment_type', 'part-time');

        $posting = JobPostingModel::query()->findOrFail($response->json('data.id'));
        expect($posting->branch_id)->toBe($world['branch']->id)
            ->and($posting->status)->toBe(JobPostingStatusEnum::Open)
            ->and($posting->getTranslation('description', 'en'))->toBe('Fades and beards')
            ->and($posting->location)->toBe('Amman');
    });

    it('ignores a branch id and a status smuggled into the body', function (): void {
        $world = jobBoardWorld();
        $foreign = BranchModel::factory()->create();
        $this->authenticateDashboardActor($world['branch']);

        $response = $this->postJson(JOB_BOARD_URL."/{$world['branch']->id}/job-postings", jobBoardPayload([
            'branch_id' => $foreign->id,
            'status' => JobPostingStatusEnum::Closed->value,
        ]))->assertCreated();

        $posting = JobPostingModel::query()->findOrFail($response->json('data.id'));
        expect($posting->branch_id)->toBe($world['branch']->id)
            ->and($posting->status)->toBe(JobPostingStatusEnum::Open)
            ->and(JobPostingModel::query()->where('branch_id', $foreign->id)->count())->toBe(0);
    });

    it('validates every field and writes nothing', function (array $payload, string $field): void {
        $world = jobBoardWorld();
        $this->authenticateDashboardActor($world['branch']);

        $this->postJson(JOB_BOARD_URL."/{$world['branch']->id}/job-postings", $payload)->assertUnprocessable()->assertJsonValidationErrors($field);

        expect(JobPostingModel::query()->count())->toBe(0);
    })->with([
        'no title' => [['description' => ['en' => 'a', 'ar' => 'ب']], 'title'],
        'no arabic title' => [jobBoardPayload(['title' => ['en' => 'Only English']]), 'title.ar'],
        'no description' => [['title' => ['en' => 'a', 'ar' => 'ب']], 'description'],
        'unknown language' => [jobBoardPayload(['title' => ['en' => 'a', 'ar' => 'ب', 'fr' => 'c']]), 'title'],
        'title too long' => [jobBoardPayload(['title' => ['en' => str_repeat('a', 300), 'ar' => 'ب']]), 'title.en'],
        'unknown employment type' => [jobBoardPayload(['employment_type' => 'forever']), 'employment_type'],
        'location too long' => [jobBoardPayload(['location' => str_repeat('a', 300)]), 'location'],
    ]);

    it('needs the job board feature, whatever the actor', function (): void {
        $world = jobBoardWorld();
        app(BrandFeatures::class)->set($world['brand'], [BrandFeatureConstants::BRAND_FEATURE_JOB_BOARD => false]);

        $this->authenticateDashboardActor($world['owner']);
        $this->postJson(JOB_BOARD_URL."/{$world['branch']->id}/job-postings", jobBoardPayload())
            ->assertForbidden()->assertJsonPath('code', 'feature_not_enabled');
        jobBoardSwitchTo($world['branch']);
        $this->postJson(JOB_BOARD_URL."/{$world['branch']->id}/job-postings", jobBoardPayload())->assertForbidden();

        expect(JobPostingModel::query()->count())->toBe(0);
    });

    it('lets an owner post to their brand\'s branch only, and keeps a manager to their own branch', function (): void {
        $world = jobBoardWorld();
        $foreign = jobBoardWorld();
        $sibling = BranchModel::factory()->create(['brand_id' => $world['brand']->id]);

        $this->authenticateDashboardActor($world['owner']);
        $this->postJson(JOB_BOARD_URL."/{$world['branch']->id}/job-postings", jobBoardPayload())->assertCreated();
        $this->postJson(JOB_BOARD_URL."/{$foreign['branch']->id}/job-postings", jobBoardPayload())->assertNotFound();

        jobBoardSwitchTo($world['branch']);
        $this->postJson(JOB_BOARD_URL."/{$sibling->id}/job-postings", jobBoardPayload())->assertNotFound();

        expect(JobPostingModel::query()->count())->toBe(1);
    });

    it('is closed to a barber and to an anonymous caller (the admin is covered in DashboardAdminStaffingTest)', function (): void {
        $world = jobBoardWorld();
        $url = JOB_BOARD_URL."/{$world['branch']->id}/job-postings";

        $this->postJson($url, jobBoardPayload())->assertUnauthorized();
        jobBoardSwitchTo(BarberModel::factory()->create());
        $this->postJson($url, jobBoardPayload())->assertForbidden();

        expect(JobPostingModel::query()->count())->toBe(0);
    });
});

describe('List and read job postings (NS-17)', function (): void {
    it('lists only the branch\'s postings, newest first, each with its application count', function (): void {
        $world = jobBoardWorld();
        $older = JobPostingModel::factory()->create(['branch_id' => $world['branch']->id, 'created_at' => now()->subDay()]);
        $newer = JobPostingModel::factory()->create(['branch_id' => $world['branch']->id, 'created_at' => now()]);
        ApplicationModel::factory()->count(2)->create(['job_posting_id' => $newer->id]);
        JobPostingModel::factory()->create();
        $this->authenticateDashboardActor($world['branch']);

        $response = $this->getJson(JOB_BOARD_URL."/{$world['branch']->id}/job-postings")->assertOk();

        expect(collect($response->json('data'))->pluck('id')->all())->toBe([$newer->id, $older->id])
            ->and($response->json('data.0.applications_count'))->toBe(2)
            ->and($response->json('data.1.applications_count'))->toBe(0);
    });

    it('stays readable when the job board is off, and answers 404 across brands', function (): void {
        $world = jobBoardWorld();
        app(BrandFeatures::class)->set($world['brand'], [BrandFeatureConstants::BRAND_FEATURE_JOB_BOARD => false]);
        $existing = JobPostingModel::factory()->create(['branch_id' => $world['branch']->id]);
        $foreign = jobBoardWorld();

        $this->authenticateDashboardActor($world['owner']);
        expect(collect($this->getJson(JOB_BOARD_URL."/{$world['branch']->id}/job-postings")->assertOk()->json('data'))->pluck('id')->all())->toBe([$existing->id]);
        $this->getJson(JOB_BOARD_URL."/{$foreign['branch']->id}/job-postings")->assertNotFound();
    });

    it('is closed to a barber and an anonymous caller', function (): void {
        $world = jobBoardWorld();
        $url = JOB_BOARD_URL."/{$world['branch']->id}/job-postings";

        $this->getJson($url)->assertUnauthorized();
        jobBoardSwitchTo(BarberModel::factory()->create());
        $this->getJson($url)->assertForbidden();
    });
});

describe('Edit and delete a job posting (NS-17)', function (): void {
    it('changes only the fields sent and keeps the rest', function (): void {
        $world = jobBoardWorld();
        $posting = JobPostingModel::factory()->create(['branch_id' => $world['branch']->id, 'location' => 'Irbid']);
        $title = $posting->getTranslations('title');
        $this->authenticateDashboardActor($world['branch']);

        $this->putJson(JOB_BOARD_URL."/{$world['branch']->id}/job-postings/{$posting->id}", ['description' => ['en' => 'New text', 'ar' => 'نص جديد']])
            ->assertOk()
            ->assertJsonPath('data.description.en', 'New text');

        expect($posting->fresh())
            ->getTranslations('title')->toEqual($title)
            ->location->toBe('Irbid')
            ->status->toBe(JobPostingStatusEnum::Open);
    });

    it('closes and reopens a posting', function (): void {
        $world = jobBoardWorld();
        $posting = JobPostingModel::factory()->create(['branch_id' => $world['branch']->id]);
        $this->authenticateDashboardActor($world['owner']);
        $url = JOB_BOARD_URL."/{$world['branch']->id}/job-postings/{$posting->id}";

        $this->putJson($url, ['status' => 'closed'])->assertOk()->assertJsonPath('data.status', 'closed');
        expect($posting->fresh()->status)->toBe(JobPostingStatusEnum::Closed);
        $this->putJson($url, ['status' => 'open'])->assertOk();
        expect($posting->fresh()->status)->toBe(JobPostingStatusEnum::Open);
    });

    it('cannot move a posting to another branch through the body', function (): void {
        $world = jobBoardWorld();
        $foreign = BranchModel::factory()->create();
        $posting = JobPostingModel::factory()->create(['branch_id' => $world['branch']->id]);
        $this->authenticateDashboardActor($world['branch']);

        $this->putJson(JOB_BOARD_URL."/{$world['branch']->id}/job-postings/{$posting->id}", ['branch_id' => $foreign->id, 'status' => 'closed'])->assertOk();

        expect($posting->fresh()->branch_id)->toBe($world['branch']->id);
    });

    it('validates the edit and leaves the posting unchanged', function (array $payload, string $field): void {
        $world = jobBoardWorld();
        $posting = JobPostingModel::factory()->create(['branch_id' => $world['branch']->id]);
        $before = $posting->only(['location', 'status', 'employment_type']);
        $this->authenticateDashboardActor($world['branch']);

        $this->putJson(JOB_BOARD_URL."/{$world['branch']->id}/job-postings/{$posting->id}", $payload)->assertUnprocessable()->assertJsonValidationErrors($field);

        expect($posting->fresh()->only(['location', 'status', 'employment_type']))->toEqual($before);
    })->with([
        'unknown status' => [['status' => 'deleted'], 'status'],
        'title without arabic' => [['title' => ['en' => 'Only']], 'title.ar'],
        'unknown type' => [['employment_type' => 'gig'], 'employment_type'],
    ]);

    it('answers 404 for another branch\'s posting and changes nothing', function (): void {
        $world = jobBoardWorld();
        $foreign = JobPostingModel::factory()->create();
        $this->authenticateDashboardActor($world['branch']);

        $this->putJson(JOB_BOARD_URL."/{$world['branch']->id}/job-postings/{$foreign->id}", ['status' => 'closed'])->assertNotFound();
        $this->putJson(JOB_BOARD_URL."/{$foreign->branch_id}/job-postings/{$foreign->id}", ['status' => 'closed'])->assertNotFound();

        expect($foreign->fresh()->status)->toBe(JobPostingStatusEnum::Open);
    });

    it('blocks an edit while the job board is off but still allows closing the shop down by delete', function (): void {
        $world = jobBoardWorld();
        $posting = JobPostingModel::factory()->create(['branch_id' => $world['branch']->id]);
        app(BrandFeatures::class)->set($world['brand'], [BrandFeatureConstants::BRAND_FEATURE_JOB_BOARD => false]);
        $this->authenticateDashboardActor($world['branch']);
        $url = JOB_BOARD_URL."/{$world['branch']->id}/job-postings/{$posting->id}";

        $this->putJson($url, ['status' => 'closed'])->assertForbidden()->assertJsonPath('code', 'feature_not_enabled');
        expect($posting->fresh()->status)->toBe(JobPostingStatusEnum::Open);
        $this->deleteJson($url)->assertOk();
    });

    it('deletes a posting together with its applications and leaves other postings alone', function (): void {
        $world = jobBoardWorld();
        $posting = JobPostingModel::factory()->create(['branch_id' => $world['branch']->id]);
        $application = ApplicationModel::factory()->create(['job_posting_id' => $posting->id]);
        $other = JobPostingModel::factory()->create(['branch_id' => $world['branch']->id]);
        $otherApplication = ApplicationModel::factory()->create(['job_posting_id' => $other->id]);
        $this->authenticateDashboardActor($world['owner']);

        $this->deleteJson(JOB_BOARD_URL."/{$world['branch']->id}/job-postings/{$posting->id}")->assertOk();

        $this->assertDatabaseMissing('job_postings', ['id' => $posting->id]);
        $this->assertDatabaseMissing('job_applications', ['id' => $application->id]);
        $this->assertDatabaseHas('job_postings', ['id' => $other->id]);
        $this->assertDatabaseHas('job_applications', ['id' => $otherApplication->id]);
    });

    it('refuses a barber and anonymous callers on edit and delete', function (): void {
        $world = jobBoardWorld();
        $posting = JobPostingModel::factory()->create(['branch_id' => $world['branch']->id]);
        $url = JOB_BOARD_URL."/{$world['branch']->id}/job-postings/{$posting->id}";

        $this->putJson($url, ['status' => 'closed'])->assertUnauthorized();
        $this->deleteJson($url)->assertUnauthorized();
        jobBoardSwitchTo(BarberModel::factory()->create());
        $this->putJson($url, ['status' => 'closed'])->assertForbidden();
        $this->deleteJson($url)->assertForbidden();

        expect($posting->fresh()->status)->toBe(JobPostingStatusEnum::Open);
    });
});

describe('Review applications (NS-17)', function (): void {
    it('lists only the posting\'s applications, newest first', function (): void {
        $world = jobBoardWorld();
        $posting = JobPostingModel::factory()->create(['branch_id' => $world['branch']->id]);
        $older = ApplicationModel::factory()->create(['job_posting_id' => $posting->id, 'created_at' => now()->subDay()]);
        $newer = ApplicationModel::factory()->create(['job_posting_id' => $posting->id, 'created_at' => now()]);
        ApplicationModel::factory()->create(['job_posting_id' => JobPostingModel::factory()->create(['branch_id' => $world['branch']->id])->id]);
        $this->authenticateDashboardActor($world['owner']);

        $response = $this->getJson(JOB_BOARD_URL."/{$world['branch']->id}/job-postings/{$posting->id}/applications")->assertOk();

        expect(collect($response->json('data'))->pluck('id')->all())->toBe([$newer->id, $older->id])
            ->and($response->json('data.0.barber_id'))->toBe($newer->barber_id);
    });

    it('answers 404 for another brand\'s posting and for a posting under the wrong branch', function (): void {
        $world = jobBoardWorld();
        $mine = JobPostingModel::factory()->create(['branch_id' => $world['branch']->id]);
        $foreign = JobPostingModel::factory()->create();
        $sibling = BranchModel::factory()->create(['brand_id' => $world['brand']->id]);
        $this->authenticateDashboardActor($world['owner']);

        $this->getJson(JOB_BOARD_URL."/{$foreign->branch_id}/job-postings/{$foreign->id}/applications")->assertNotFound();
        $this->getJson(JOB_BOARD_URL."/{$world['branch']->id}/job-postings/{$foreign->id}/applications")->assertNotFound();
        $this->getJson(JOB_BOARD_URL."/{$sibling->id}/job-postings/{$mine->id}/applications")->assertNotFound();
    });

    it('is closed to a barber and an anonymous caller', function (): void {
        $world = jobBoardWorld();
        $posting = JobPostingModel::factory()->create(['branch_id' => $world['branch']->id]);
        $url = JOB_BOARD_URL."/{$world['branch']->id}/job-postings/{$posting->id}/applications";

        $this->getJson($url)->assertUnauthorized();
        jobBoardSwitchTo(BarberModel::factory()->create());
        $this->getJson($url)->assertForbidden();
    });
});

describe('Decide an application (NS-17)', function (): void {
    it('allows exactly the documented transitions and queues a notice only for the ones it makes', function (ApplicationStatus $from, ApplicationStatus $to, bool $allowed): void {
        Queue::fake();
        $world = jobBoardWorld();
        $posting = JobPostingModel::factory()->create(['branch_id' => $world['branch']->id]);
        $application = ApplicationModel::factory()->create(['job_posting_id' => $posting->id, 'status' => $from->value]);
        $this->authenticateDashboardActor($world['branch']);

        $response = $this->patchJson(JOB_BOARD_URL."/{$world['branch']->id}/job-postings/{$posting->id}/applications/{$application->id}/status", ['status' => $to->value]);

        if ($allowed) {
            $response->assertOk()->assertJsonPath('data.status', $to->value);
            Queue::assertPushed(JobApplicationStatusChangedNotification::class, 1);
        } else {
            $response->assertUnprocessable()->assertJsonValidationErrors('status');
            Queue::assertNothingPushed();
        }
        expect($application->fresh()->status)->toBe($allowed ? $to : $from);
    })->with([
        'submitted to seen' => [ApplicationStatus::Submitted, ApplicationStatus::Seen, true],
        'submitted to accepted' => [ApplicationStatus::Submitted, ApplicationStatus::Accepted, true],
        'submitted to rejected' => [ApplicationStatus::Submitted, ApplicationStatus::Rejected, true],
        'seen to accepted' => [ApplicationStatus::Seen, ApplicationStatus::Accepted, true],
        'seen to rejected' => [ApplicationStatus::Seen, ApplicationStatus::Rejected, true],
        'submitted to submitted' => [ApplicationStatus::Submitted, ApplicationStatus::Submitted, false],
        'seen to submitted' => [ApplicationStatus::Seen, ApplicationStatus::Submitted, false],
        'seen to seen' => [ApplicationStatus::Seen, ApplicationStatus::Seen, false],
        'accepted to rejected' => [ApplicationStatus::Accepted, ApplicationStatus::Rejected, false],
        'accepted to seen' => [ApplicationStatus::Accepted, ApplicationStatus::Seen, false],
        'rejected to accepted' => [ApplicationStatus::Rejected, ApplicationStatus::Accepted, false],
        'rejected to seen' => [ApplicationStatus::Rejected, ApplicationStatus::Seen, false],
    ]);

    it('validates the status value', function (array $payload): void {
        $world = jobBoardWorld();
        $posting = JobPostingModel::factory()->create(['branch_id' => $world['branch']->id]);
        $application = ApplicationModel::factory()->create(['job_posting_id' => $posting->id]);
        $this->authenticateDashboardActor($world['branch']);

        $this->patchJson(JOB_BOARD_URL."/{$world['branch']->id}/job-postings/{$posting->id}/applications/{$application->id}/status", $payload)
            ->assertUnprocessable()->assertJsonValidationErrors('status');

        expect($application->fresh()->status)->toBe(ApplicationStatus::Submitted);
    })->with(['missing' => [[]], 'unknown' => [['status' => 'hired']], 'null' => [['status' => null]]]);

    it('lets an owner decide, and answers 404 for an application of another posting or brand', function (): void {
        $world = jobBoardWorld();
        $posting = JobPostingModel::factory()->create(['branch_id' => $world['branch']->id]);
        $sameBranchOther = JobPostingModel::factory()->create(['branch_id' => $world['branch']->id]);
        $strayApplication = ApplicationModel::factory()->create(['job_posting_id' => $sameBranchOther->id]);
        $mine = ApplicationModel::factory()->create(['job_posting_id' => $posting->id]);
        $foreign = ApplicationModel::factory()->create();
        $this->authenticateDashboardActor($world['owner']);
        $path = fn (JobPostingModel $job, string $branchId, ApplicationModel $application): string => JOB_BOARD_URL."/{$branchId}/job-postings/{$job->id}/applications/{$application->id}/status";

        $this->patchJson($path($posting, $world['branch']->id, $strayApplication), ['status' => 'accepted'])->assertNotFound();
        $this->patchJson($path($posting, $world['branch']->id, $foreign), ['status' => 'accepted'])->assertNotFound();
        $this->patchJson($path($foreign->jobPosting, $foreign->jobPosting->branch_id, $foreign), ['status' => 'accepted'])->assertNotFound();
        $this->patchJson($path($posting, $world['branch']->id, $mine), ['status' => 'accepted'])->assertOk();

        expect($strayApplication->fresh()->status)->toBe(ApplicationStatus::Submitted)
            ->and($foreign->fresh()->status)->toBe(ApplicationStatus::Submitted)
            ->and($mine->fresh()->status)->toBe(ApplicationStatus::Accepted);
    });

    it('is closed to a barber and an anonymous caller, and still works after the job board is switched off', function (): void {
        $world = jobBoardWorld();
        $posting = JobPostingModel::factory()->create(['branch_id' => $world['branch']->id]);
        $application = ApplicationModel::factory()->create(['job_posting_id' => $posting->id]);
        $url = JOB_BOARD_URL."/{$world['branch']->id}/job-postings/{$posting->id}/applications/{$application->id}/status";

        $this->patchJson($url, ['status' => 'seen'])->assertUnauthorized();
        jobBoardSwitchTo(BarberModel::factory()->create());
        $this->patchJson($url, ['status' => 'seen'])->assertForbidden();
        expect($application->fresh()->status)->toBe(ApplicationStatus::Submitted);

        app(BrandFeatures::class)->set($world['brand'], [BrandFeatureConstants::BRAND_FEATURE_JOB_BOARD => false]);
        jobBoardSwitchTo($world['branch']);
        $this->patchJson($url, ['status' => 'seen'])->assertOk();
    });
});
