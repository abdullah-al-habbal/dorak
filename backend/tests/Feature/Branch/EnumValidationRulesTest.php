<?php

declare(strict_types=1);

use Illuminate\Support\Str;
use Modules\Branch\Models\BranchModel;
use Modules\Chair\Enums\ChairStatus;
use Modules\Chair\Models\ChairModel;
use Modules\JobPosting\Enums\JobPostingStatusEnum;
use Modules\JobPosting\Enums\JobPostingTypeEnum;

beforeEach(function (): void {
    $this->branch = BranchModel::factory()->create();
    $this->actingAs($this->branch, 'branch_api');
});

it('rejects an unknown chair status on the branch toggle', function (): void {
    $chair = ChairModel::factory()->create(['branch_id' => $this->branch->id]);

    $this->patchJson("/api/v1/branch/chairs/{$chair->id}/status", ['status' => 'broken'])
        ->assertUnprocessable();
});

it('accepts every chair status case on the branch toggle', function (ChairStatus $status): void {
    $chair = ChairModel::factory()->create(['branch_id' => $this->branch->id]);

    $this->patchJson("/api/v1/branch/chairs/{$chair->id}/status", ['status' => $status->value])
        ->assertOk()
        ->assertJsonPath('data.status', $status->value);
})->with(ChairStatus::cases());

it('rejects an unknown chair status filter on the chairs list', function (): void {
    $this->getJson('/api/v1/chairs?status=broken')->assertUnprocessable();
});

it('rejects an unknown job posting status or type on update', function (array $payload): void {
    $this->putJson('/api/v1/branch/job-postings/'.Str::uuid(), $payload)->assertUnprocessable();
})->with([
    'status' => [['status' => 'paused']],
    'employment_type' => [['employment_type' => 'freelance']],
]);

it('rejects an unknown job posting type on create', function (): void {
    $this->postJson('/api/v1/branch/job-postings', [
        'title' => ['en' => 'Barber', 'ar' => 'حلاق'],
        'description' => ['en' => 'Cuts', 'ar' => 'قص'],
        'employment_type' => 'freelance',
    ])->assertUnprocessable();
});

it('exposes the documented job posting backing values', function (): void {
    expect(array_column(JobPostingStatusEnum::cases(), 'value'))->toBe(['open', 'closed', 'archived'])
        ->and(array_column(JobPostingTypeEnum::cases(), 'value'))->toBe(['full-time', 'part-time', 'contract']);
});
