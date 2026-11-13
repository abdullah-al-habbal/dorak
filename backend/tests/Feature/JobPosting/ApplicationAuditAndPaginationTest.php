<?php

declare(strict_types=1);

use Modules\Admin\Models\AdminModel;
use Modules\Audit\Models\StatusChangeLogModel;
use Modules\Branch\Models\BranchModel;
use Modules\Brand\Models\BrandModel;
use Modules\Client\Models\ClientModel;
use Modules\JobPosting\Enums\ApplicationStatus;
use Modules\JobPosting\Models\ApplicationModel;
use Modules\JobPosting\Models\JobPostingModel;

/**
 * Batch 1 (WP-1): every application status change is written to the status-change log with its actor, and
 * the branch API application list is capped.
 *
 * @return array{owner: ClientModel, branch: BranchModel, posting: JobPostingModel}
 */
function applicationAuditWorld(): array
{
    $owner = ClientModel::factory()->create();
    $brand = BrandModel::factory()->create(['owner_id' => $owner->id]);
    $branch = BranchModel::factory()->create(['brand_id' => $brand->id]);

    return ['owner' => $owner, 'branch' => $branch, 'posting' => JobPostingModel::factory()->create(['branch_id' => $branch->id])];
}

/** @return list<StatusChangeLogModel> */
function applicationAuditRows(ApplicationModel $application): array
{
    return StatusChangeLogModel::query()->where('subject_type', 'job_application')->where('subject_id', $application->id)->get()->all();
}

describe('Application status changes are audited', function (): void {
    it('logs a branch decision with the branch as actor', function (): void {
        $world = applicationAuditWorld();
        $application = ApplicationModel::factory()->create(['job_posting_id' => $world['posting']->id]);
        $this->actingAs($world['branch'], 'branch_api');

        $this->patchJson("/api/v1/branch/job-postings/{$world['posting']->id}/applications/{$application->id}/status", ['status' => ApplicationStatus::Accepted])->assertOk();

        $rows = applicationAuditRows($application);
        expect($rows)->toHaveCount(1)
            ->and($rows[0])->from_status->toBe('submitted')->to_status->toBe('accepted')->actor_id->toBe($world['branch']->id)
            ->and($rows[0]->actor_type->value)->toBe('branch');
    });

    it('names the platform admin when the admin decides in the dashboard, and the branch for the owner', function (): void {
        $world = applicationAuditWorld();
        $byAdmin = ApplicationModel::factory()->create(['job_posting_id' => $world['posting']->id]);
        $byOwner = ApplicationModel::factory()->create(['job_posting_id' => $world['posting']->id]);
        $admin = AdminModel::factory()->create();
        $url = fn (ApplicationModel $application): string => "/api/v1/dashboard/branches/{$world['branch']->id}/job-postings/{$world['posting']->id}/applications/{$application->id}/status";

        $this->authenticateDashboardActor($admin);
        $this->patchJson($url($byAdmin), ['status' => ApplicationStatus::Rejected])->assertOk();
        app('auth')->forgetGuards();
        $this->flushHeaders();
        $this->authenticateDashboardActor($world['owner']);
        $this->patchJson($url($byOwner), ['status' => ApplicationStatus::Accepted])->assertOk();

        $adminRow = applicationAuditRows($byAdmin)[0];
        $ownerRow = applicationAuditRows($byOwner)[0];
        expect($adminRow->actor_type->value)->toBe('admin')->and($adminRow->actor_id)->toBe($admin->id)
            ->and($ownerRow->actor_type->value)->toBe('branch')->and($ownerRow->actor_id)->toBe($world['branch']->id);
    });

    it('writes nothing for a refused transition', function (): void {
        $world = applicationAuditWorld();
        $application = ApplicationModel::factory()->create(['job_posting_id' => $world['posting']->id, 'status' => ApplicationStatus::Rejected->value]);
        $this->actingAs($world['branch'], 'branch_api');

        $this->patchJson("/api/v1/branch/job-postings/{$world['posting']->id}/applications/{$application->id}/status", ['status' => ApplicationStatus::Accepted])->assertUnprocessable();

        expect(applicationAuditRows($application))->toBe([])->and($application->fresh()->status)->toBe(ApplicationStatus::Rejected);
    });

    it('logs one row per application moved to seen, none for decided ones, and none when repeated', function (): void {
        $world = applicationAuditWorld();
        $new = ApplicationModel::factory()->count(2)->create(['job_posting_id' => $world['posting']->id]);
        $decided = ApplicationModel::factory()->create(['job_posting_id' => $world['posting']->id, 'status' => ApplicationStatus::Accepted->value]);
        $elsewhere = ApplicationModel::factory()->create();
        $this->actingAs($world['branch'], 'branch_api');
        $url = "/api/v1/branch/job-postings/{$world['posting']->id}/applications/mark-seen";

        $this->postJson($url)->assertOk()->assertJsonPath('data.updated', 2);
        $this->postJson($url)->assertOk()->assertJsonPath('data.updated', 0);

        foreach ($new as $application) {
            $rows = applicationAuditRows($application);
            expect($rows)->toHaveCount(1)->and($rows[0])->from_status->toBe('submitted')->to_status->toBe('seen')->actor_id->toBe($world['branch']->id);
        }
        expect(applicationAuditRows($decided))->toBe([])->and(applicationAuditRows($elsewhere))->toBe([])->and($elsewhere->fresh()->status)->toBe(ApplicationStatus::Submitted);
    });

    it('names the admin when the admin marks applications seen in the dashboard', function (): void {
        $world = applicationAuditWorld();
        $application = ApplicationModel::factory()->create(['job_posting_id' => $world['posting']->id]);
        $admin = AdminModel::factory()->create();
        $this->authenticateDashboardActor($admin);

        $this->postJson("/api/v1/dashboard/branches/{$world['branch']->id}/job-postings/{$world['posting']->id}/applications/mark-seen")->assertOk();

        expect(applicationAuditRows($application)[0]->actor_id)->toBe($admin->id);
    });
});

describe('The branch API application list is capped', function (): void {
    it('rejects a page size outside 1..100 and a non-number, and returns nothing extra', function (string $perPage): void {
        $world = applicationAuditWorld();
        ApplicationModel::factory()->count(3)->create(['job_posting_id' => $world['posting']->id]);
        $this->actingAs($world['branch'], 'branch_api');

        $this->getJson("/api/v1/branch/job-postings/{$world['posting']->id}/applications?per_page={$perPage}")
            ->assertUnprocessable()->assertJsonValidationErrors('per_page');
    })->with(['101', '0', '-5', 'many', '1000000']);

    it('applies the requested size up to 100 and a default of 15', function (): void {
        $world = applicationAuditWorld();
        ApplicationModel::factory()->count(17)->create(['job_posting_id' => $world['posting']->id]);
        $this->actingAs($world['branch'], 'branch_api');
        $url = "/api/v1/branch/job-postings/{$world['posting']->id}/applications";

        expect($this->getJson($url)->assertOk()->json('data'))->toHaveCount(15)
            ->and($this->getJson("{$url}?per_page=2")->assertOk()->json('data'))->toHaveCount(2)
            ->and($this->getJson("{$url}?per_page=100")->assertOk()->json('data'))->toHaveCount(17);
    });

    it('keeps another branch\'s posting out of reach', function (): void {
        $world = applicationAuditWorld();
        $foreign = JobPostingModel::factory()->create();
        $this->actingAs($world['branch'], 'branch_api');

        $this->getJson("/api/v1/branch/job-postings/{$foreign->id}/applications")->assertNotFound();
    });
});
