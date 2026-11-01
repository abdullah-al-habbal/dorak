<?php

declare(strict_types=1);

use Modules\Branch\Models\BranchModel;
use Modules\JobPosting\Enums\JobPostingStatusEnum;
use Modules\JobPosting\Models\ApplicationModel;
use Modules\JobPosting\Models\JobPostingModel;

it('closes open postings and keeps their applications when the branch is deleted', function (): void {
    $branch = BranchModel::factory()->create();
    $openPosting = JobPostingModel::factory()->create(['branch_id' => $branch->id, 'status' => JobPostingStatusEnum::Open]);
    $closedPosting = JobPostingModel::factory()->create(['branch_id' => $branch->id, 'status' => JobPostingStatusEnum::Closed]);
    $application = ApplicationModel::factory()->create(['job_posting_id' => $openPosting->id]);

    $branch->delete();

    expect($openPosting->refresh()->status->value)->toBe(JobPostingStatusEnum::Closed->value);
    expect($closedPosting->refresh()->status->value)->toBe(JobPostingStatusEnum::Closed->value);
    $this->assertDatabaseHas('job_applications', ['id' => $application->id]);
    $this->assertDatabaseHas('job_postings', ['id' => $openPosting->id, 'branch_id' => null]);
});
