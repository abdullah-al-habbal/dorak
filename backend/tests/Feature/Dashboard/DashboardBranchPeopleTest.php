<?php

declare(strict_types=1);

use Modules\Admin\Models\AdminModel;
use Modules\Barber\Models\BarberModel;
use Modules\BarberAffiliation\Enums\AffiliationInitiatorTypeEnum;
use Modules\BarberAffiliation\Enums\AffiliationStatus;
use Modules\BarberAffiliation\Models\BarberAffiliationModel;
use Modules\Branch\Models\BranchModel;
use Modules\Brand\Constants\BrandFeatureConstants;
use Modules\Brand\Services\BrandFeatures;
use Modules\JobPosting\Enums\ApplicationStatus;
use Modules\JobPosting\Enums\JobPostingStatusEnum;
use Modules\JobPosting\Models\ApplicationModel;
use Modules\JobPosting\Models\JobPostingModel;

function pendingAffiliationFor(BranchModel $branch, array $overrides = []): BarberAffiliationModel
{
    return BarberAffiliationModel::factory()->pending()->create([
        'affiliable_id' => $branch->id,
        'initiated_by_type' => AffiliationInitiatorTypeEnum::Barber,
        ...$overrides,
    ]);
}

function enableJobBoard(BranchModel $branch): void
{
    app(BrandFeatures::class)->set($branch->brand, [BrandFeatureConstants::BRAND_FEATURE_JOB_BOARD => true]);
}

$posting = ['title' => ['en' => 'Barber', 'ar' => 'حلاق'], 'description' => ['en' => 'Cut hair', 'ar' => 'قص الشعر']];

describe('Dashboard branch affiliations', function (): void {
    it('lets a manager accept a pending affiliation and reflects it in the list', function (): void {
        $branch = BranchModel::factory()->create();
        $affiliation = pendingAffiliationFor($branch);
        $this->authenticateDashboardActor($branch);

        $this->postJson("/api/v1/dashboard/branches/{$branch->id}/affiliations/{$affiliation->id}/accept")
            ->assertOk()
            ->assertJsonPath('data.status', AffiliationStatus::Active->value);

        $this->getJson("/api/v1/dashboard/branches/{$branch->id}/affiliations?status=active")
            ->assertOk()
            ->assertJsonCount(1, 'data');
        $this->getJson("/api/v1/dashboard/branches/{$branch->id}/affiliations?status=pending")
            ->assertOk()
            ->assertJsonCount(0, 'data');
    });

    it('rejects a pending affiliation', function (): void {
        $branch = BranchModel::factory()->create();
        $affiliation = pendingAffiliationFor($branch);
        $this->authenticateDashboardActor($branch);

        $this->postJson("/api/v1/dashboard/branches/{$branch->id}/affiliations/{$affiliation->id}/reject")
            ->assertOk()
            ->assertJsonPath('data.status', AffiliationStatus::Rejected->value);
    });

    it('keeps another branch affiliations out of reach', function (): void {
        $branch = BranchModel::factory()->create();
        $other = BranchModel::factory()->create();
        $foreign = pendingAffiliationFor($other);
        $this->authenticateDashboardActor($branch);

        $this->postJson("/api/v1/dashboard/branches/{$other->id}/affiliations/{$foreign->id}/accept")->assertNotFound();
        $this->postJson("/api/v1/dashboard/branches/{$branch->id}/affiliations/{$foreign->id}/accept")->assertNotFound();
        expect($foreign->fresh()->status)->toBe(AffiliationStatus::Pending);
    });

    it('refuses to accept an invite the branch sent itself', function (): void {
        $branch = BranchModel::factory()->create();
        $own = pendingAffiliationFor($branch, ['initiated_by_type' => AffiliationInitiatorTypeEnum::Branch, 'initiated_by_id' => $branch->id]);
        $this->authenticateDashboardActor($branch);

        $this->postJson("/api/v1/dashboard/branches/{$branch->id}/affiliations/{$own->id}/accept")->assertForbidden();
    });

    it('invites a barber, blocks duplicates and terminates an active affiliation', function (): void {
        $branch = BranchModel::factory()->create();
        $barber = BarberModel::factory()->create();
        $this->authenticateDashboardActor($branch);

        $created = $this->postJson("/api/v1/dashboard/branches/{$branch->id}/affiliations", ['barber_id' => $barber->id])
            ->assertCreated()
            ->assertJsonPath('data.status', AffiliationStatus::Pending->value);
        $this->postJson("/api/v1/dashboard/branches/{$branch->id}/affiliations", ['barber_id' => $barber->id])->assertStatus(409);
        $this->postJson("/api/v1/dashboard/branches/{$branch->id}/affiliations", ['barber_id' => 'missing'])->assertUnprocessable();

        $active = BarberAffiliationModel::factory()->create(['affiliable_id' => $branch->id]);
        $this->postJson("/api/v1/dashboard/branches/{$branch->id}/affiliations/{$active->id}/terminate")
            ->assertOk()
            ->assertJsonPath('data.status', AffiliationStatus::Terminated->value);
        expect($created->json('data.id'))->not->toBeNull();
    });

    it('lets an admin respond on any branch', function (): void {
        $branch = BranchModel::factory()->create();
        $affiliation = pendingAffiliationFor($branch);
        $this->authenticateDashboardActor(AdminModel::factory()->create());

        $this->postJson("/api/v1/dashboard/branches/{$branch->id}/affiliations/{$affiliation->id}/accept")->assertOk();
    });
});

describe('Dashboard branch job postings', function () use ($posting): void {
    it('creates, edits and deletes a posting', function () use ($posting): void {
        $branch = BranchModel::factory()->create();
        enableJobBoard($branch);
        $this->authenticateDashboardActor($branch);

        $id = $this->postJson("/api/v1/dashboard/branches/{$branch->id}/job-postings", $posting)
            ->assertCreated()
            ->json('data.id');
        $this->putJson("/api/v1/dashboard/branches/{$branch->id}/job-postings/{$id}", ['status' => JobPostingStatusEnum::Closed])
            ->assertOk()
            ->assertJsonPath('data.status', JobPostingStatusEnum::Closed->value);
        $this->deleteJson("/api/v1/dashboard/branches/{$branch->id}/job-postings/{$id}")->assertOk();
        expect(JobPostingModel::find($id))->toBeNull();
    });

    it('returns per-field validation errors', function (): void {
        $branch = BranchModel::factory()->create();
        enableJobBoard($branch);
        $this->authenticateDashboardActor($branch);

        $this->postJson("/api/v1/dashboard/branches/{$branch->id}/job-postings", ['title' => ['en' => 'x']])
            ->assertUnprocessable()
            ->assertJsonValidationErrors(['title.ar', 'description']);
    });

    it('requires the job_board feature for writes only', function () use ($posting): void {
        $branch = BranchModel::factory()->create();
        $existing = JobPostingModel::factory()->create(['branch_id' => $branch->id]);
        $this->authenticateDashboardActor($branch);

        $this->postJson("/api/v1/dashboard/branches/{$branch->id}/job-postings", $posting)->assertForbidden();
        $this->deleteJson("/api/v1/dashboard/branches/{$branch->id}/job-postings/{$existing->id}")->assertOk();
    });

    it('does not expose or touch another branch posting', function (): void {
        $branch = BranchModel::factory()->create();
        enableJobBoard($branch);
        $foreign = JobPostingModel::factory()->create();
        $this->authenticateDashboardActor($branch);

        $this->deleteJson("/api/v1/dashboard/branches/{$branch->id}/job-postings/{$foreign->id}")->assertNotFound();
        $this->deleteJson("/api/v1/dashboard/branches/{$foreign->branch_id}/job-postings/{$foreign->id}")->assertNotFound();
        expect(JobPostingModel::find($foreign->id))->not->toBeNull();
    });
});

describe('Dashboard branch applications', function (): void {
    it('lists snapshot fields, marks them seen and applies a valid decision', function (): void {
        $branch = BranchModel::factory()->create();
        $job = JobPostingModel::factory()->create(['branch_id' => $branch->id]);
        $application = ApplicationModel::factory()->create(['job_posting_id' => $job->id]);
        $this->authenticateDashboardActor($branch);

        $this->getJson("/api/v1/dashboard/branches/{$branch->id}/job-postings/{$job->id}/applications")
            ->assertOk()
            ->assertJsonPath('data.0.profile_snapshot.bio', $application->profile_snapshot['bio'])
            ->assertJsonPath('data.0.status', 'seen');

        $path = "/api/v1/dashboard/branches/{$branch->id}/job-postings/{$job->id}/applications/{$application->id}/status";
        $this->patchJson($path, ['status' => ApplicationStatus::Accepted])->assertOk()->assertJsonPath('data.status', ApplicationStatus::Accepted->value);
        $this->patchJson($path, ['status' => AffiliationStatus::Rejected])->assertUnprocessable();
        expect($application->fresh()->status)->toBe(ApplicationStatus::Accepted);
    });

    it('denies a decision for a non-owning branch', function (): void {
        $branch = BranchModel::factory()->create();
        $job = JobPostingModel::factory()->create();
        $application = ApplicationModel::factory()->create(['job_posting_id' => $job->id]);
        $this->authenticateDashboardActor($branch);

        $this->patchJson("/api/v1/dashboard/branches/{$branch->id}/job-postings/{$job->id}/applications/{$application->id}/status", ['status' => ApplicationStatus::Accepted])
            ->assertNotFound();
        $this->patchJson("/api/v1/dashboard/branches/{$job->branch_id}/job-postings/{$job->id}/applications/{$application->id}/status", ['status' => ApplicationStatus::Accepted])
            ->assertNotFound();
        expect($application->fresh()->status)->toBe(ApplicationStatus::Submitted);
    });
});
