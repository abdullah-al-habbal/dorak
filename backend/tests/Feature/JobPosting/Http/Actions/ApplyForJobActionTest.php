<?php

declare(strict_types=1);

use Modules\Barber\Models\BarberModel;
use Modules\Barber\Models\BarberPortfolioPhotoModel;
use Modules\JobPosting\Enums\ApplicationStatus;
use Modules\JobPosting\Enums\JobPostingStatusEnum;
use Modules\JobPosting\Models\ApplicationModel;
use Modules\JobPosting\Models\JobPostingModel;
use Modules\OfferedService\Enums\ServiceableTypeEnum;
use Modules\OfferedService\Models\OfferedServiceModel;

beforeEach(function () {
    $this->barber = BarberModel::factory()->create();
    $this->actingAs($this->barber, 'barber');
});

it('applies for open job', function () {
    $job = JobPostingModel::factory()->create(['status' => JobPostingStatusEnum::Open]);

    $response = $this->postJson("/api/v1/jobs/{$job->id}/apply");

    $response->assertCreated();
    $response->assertJsonStructure([
        'success',
        'data' => ['id', 'job_posting_id', 'barber_id', 'status'],
    ]);
    expect($response->json('data.status'))->toBe(ApplicationStatus::Submitted->value);
});

it('stores a profile snapshot with services, portfolio and bio', function () {
    $this->barber->update(['bio' => ['en' => 'Fades and tapers.', 'ar' => 'فيدات وتيبرات.']]);
    OfferedServiceModel::factory()->create(['serviceable_id' => $this->barber->id, 'serviceable_type' => ServiceableTypeEnum::Barber]);
    BarberPortfolioPhotoModel::factory()->create(['barber_id' => $this->barber->id]);
    $job = JobPostingModel::factory()->create(['status' => JobPostingStatusEnum::Open]);

    $this->postJson("/api/v1/jobs/{$job->id}/apply")->assertCreated();

    $snapshot = ApplicationModel::where('barber_id', $this->barber->id)->first()->profile_snapshot;
    expect($snapshot)->toHaveKeys(['services', 'portfolio', 'bio']);
    expect($snapshot['bio'])->toBe('Fades and tapers.');
    expect($snapshot['services'])->toHaveCount(1);
    expect($snapshot['portfolio'])->toHaveCount(1);
});

it('keeps the stored snapshot unchanged after the profile is edited', function () {
    $this->barber->update(['bio' => ['en' => 'Original bio.', 'ar' => 'نص أصلي.']]);
    $job = JobPostingModel::factory()->create(['status' => JobPostingStatusEnum::Open]);

    $this->postJson("/api/v1/jobs/{$job->id}/apply")->assertCreated();

    $this->barber->update(['bio' => ['en' => 'Updated bio.', 'ar' => 'نص محدث.']]);

    $snapshot = ApplicationModel::where('barber_id', $this->barber->id)->first()->profile_snapshot;
    expect($snapshot['bio'])->toBe('Original bio.');
});

it('rejects application for closed job', function () {
    $job = JobPostingModel::factory()->create(['status' => JobPostingStatusEnum::Closed]);

    $response = $this->postJson("/api/v1/jobs/{$job->id}/apply");

    $response->assertStatus(422);
});

it('rejects duplicate application', function () {
    $job = JobPostingModel::factory()->create(['status' => JobPostingStatusEnum::Open]);

    $this->postJson("/api/v1/jobs/{$job->id}/apply");
    $response = $this->postJson("/api/v1/jobs/{$job->id}/apply");

    $response->assertStatus(422);
});

it('requires barber authentication', function () {
    $this->app->get('auth')->forgetGuards();
    $job = JobPostingModel::factory()->create(['status' => JobPostingStatusEnum::Open]);

    $response = $this->postJson("/api/v1/jobs/{$job->id}/apply");

    $response->assertUnauthorized();
});
