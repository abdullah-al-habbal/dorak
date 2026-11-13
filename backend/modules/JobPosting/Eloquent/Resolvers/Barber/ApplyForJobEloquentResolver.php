<?php

declare(strict_types=1);

namespace Modules\JobPosting\Eloquent\Resolvers\Barber;

use Illuminate\Database\UniqueConstraintViolationException;
use Illuminate\Support\Facades\DB;
use Modules\Barber\Models\BarberModel;
use Modules\JobPosting\CQRS\Command\Barber\ApplyForJobCommand;
use Modules\JobPosting\Enums\ApplicationStatus;
use Modules\JobPosting\Models\ApplicationModel;
use Modules\JobPosting\Models\JobPostingModel;
use Modules\JobPosting\Support\BarberProfileSnapshotBuilder;
use Modules\JobPosting\ValuesObjects\ApplyForJobResult;

/**
 * Applying is serialised per posting: the posting row is locked, visibility (open posting on an Active
 * brand) is checked after the lock, and the unique (posting, barber) index is the last line of defence.
 */
final class ApplyForJobEloquentResolver
{
    public function __construct(
        private readonly BarberProfileSnapshotBuilder $snapshotBuilder,
    ) {}

    public function resolve(ApplyForJobCommand $command): ApplyForJobResult
    {
        try {
            return DB::transaction(fn (): ApplyForJobResult => $this->apply($command));
        } catch (UniqueConstraintViolationException) {
            return ApplyForJobResult::alreadyApplied();
        }
    }

    private function apply(ApplyForJobCommand $command): ApplyForJobResult
    {
        $jobPosting = JobPostingModel::query()->lockForUpdate()->findOrFail($command->jobPostingId);

        if (! JobPostingModel::query()->publiclyVisible()->whereKey($jobPosting->getKey())->exists()) {
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
