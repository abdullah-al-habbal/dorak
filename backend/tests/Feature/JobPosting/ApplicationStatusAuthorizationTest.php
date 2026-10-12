<?php

declare(strict_types=1);

use Modules\Barber\Models\BarberModel;
use Modules\Branch\Models\BranchModel;
use Modules\JobPosting\Models\ApplicationModel;
use Modules\JobPosting\Models\JobPostingModel;

function applicationStatusUrl(JobPostingModel $posting, ApplicationModel $application): string
{
    return "/api/v1/branch/job-postings/{$posting->id}/applications/{$application->id}/status";
}

it('allows the owning branch manager to accept an application', function () {
    $branch = BranchModel::factory()->create();
    $posting = JobPostingModel::factory()->create(['branch_id' => $branch->id]);
    $application = ApplicationModel::factory()->create(['job_posting_id' => $posting->id]);
    $this->actingAs($branch, 'branch_api');

    $this->patchJson(applicationStatusUrl($posting, $application), ['status' => 'accepted'])
        ->assertOk()
        ->assertJsonPath('data.status', 'accepted');

    expect($application->fresh()->status->value)->toBe('accepted');
});

it('forbids a different branch manager and leaves the application unchanged', function () {
    $posting = JobPostingModel::factory()->create();
    $application = ApplicationModel::factory()->create(['job_posting_id' => $posting->id]);
    $this->actingAs(BranchModel::factory()->create(), 'branch_api');

    $this->patchJson(applicationStatusUrl($posting, $application), ['status' => 'accepted'])
        ->assertForbidden();

    expect($application->fresh()->status->value)->toBe('submitted');
});

it('does not allow a barber to make an application decision', function () {
    $posting = JobPostingModel::factory()->create();
    $application = ApplicationModel::factory()->create(['job_posting_id' => $posting->id]);
    $barber = BarberModel::factory()->create();
    $this->actingAs($barber, 'barber');

    $this->putJson("/api/v1/applications/{$application->id}/status", ['status' => 'accepted'])
        ->assertNotFound();

    expect($application->fresh()->status->value)->toBe('submitted');
});

it('rejects terminal status transitions', function () {
    $branch = BranchModel::factory()->create();
    $posting = JobPostingModel::factory()->create(['branch_id' => $branch->id]);
    $application = ApplicationModel::factory()->create([
        'job_posting_id' => $posting->id,
        'status' => 'accepted',
    ]);
    $this->actingAs($branch, 'branch_api');

    $this->patchJson(applicationStatusUrl($posting, $application), ['status' => 'submitted'])
        ->assertUnprocessable();

    expect($application->fresh()->status->value)->toBe('accepted');
});

it('returns not found when the application does not exist', function () {
    $branch = BranchModel::factory()->create();
    $posting = JobPostingModel::factory()->create(['branch_id' => $branch->id]);
    $this->actingAs($branch, 'branch_api');

    $this->patchJson("/api/v1/branch/job-postings/{$posting->id}/applications/00000000-0000-0000-0000-000000000000/status", ['status' => 'accepted'])
        ->assertNotFound();
});

it('requires branch manager authentication', function () {
    $posting = JobPostingModel::factory()->create();
    $application = ApplicationModel::factory()->create(['job_posting_id' => $posting->id]);

    $this->patchJson(applicationStatusUrl($posting, $application), ['status' => 'accepted'])
        ->assertUnauthorized();
});
