<?php

declare(strict_types=1);

namespace Modules\JobPosting\Eloquent\Resolvers\Barber;

use Modules\Barber\Models\BarberModel;
use Modules\JobPosting\CQRS\Command\Barber\ApplyForJobCommand;
use Modules\JobPosting\Enums\ApplicationStatus;
use Modules\JobPosting\Enums\JobPostingStatusEnum;
use Modules\JobPosting\Models\ApplicationModel;
use Modules\JobPosting\Models\JobPostingModel;
use Modules\JobPosting\Support\BarberProfileSnapshotBuilder;
use Modules\JobPosting\ValuesObjects\ApplyForJobResult;

final class ApplyForJobEloquentResolver
{
    public function __construct(
        private readonly BarberProfileSnapshotBuilder $snapshotBuilder,
    ) {}

    public function resolve(ApplyForJobCommand $command): ApplyForJobResult
    {
        $jobPosting = JobPostingModel::findOrFail($command->jobPostingId);

        if ($jobPosting->status !== JobPostingStatusEnum::Open) {
            return ApplyForJobResult::notOpen();
        }

        $existing = ApplicationModel::where('job_posting_id', $jobPosting->id)
            ->where('barber_id', $command->barberId)
            ->exists();

        if ($existing) {
            return ApplyForJobResult::alreadyApplied();
        }

        $barber = BarberModel::with(['portfolioPhotos', 'services'])->findOrFail($command->barberId);

        $application = ApplicationModel::create([
            'job_posting_id' => $jobPosting->id,
            'barber_id' => $command->barberId,
            'profile_snapshot' => $this->snapshotBuilder->build($barber),
            'status' => ApplicationStatus::Submitted->value,
        ]);

        return ApplyForJobResult::success($application);
    }
}
