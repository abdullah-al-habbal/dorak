<?php

declare(strict_types=1);

namespace Modules\BarberAffiliation\Eloquent\Resolvers\Barber;

use Illuminate\Support\Facades\DB;
use Modules\Audit\Enums\StatusChangeActorTypeEnum;
use Modules\Audit\Enums\StatusChangeSubjectTypeEnum;
use Modules\Audit\Services\StatusChangeLogger;
use Modules\BarberAffiliation\CQRS\Command\Barber\AcceptAffiliationCommand;
use Modules\BarberAffiliation\Enums\AffiliableType;
use Modules\BarberAffiliation\Enums\AffiliationStatus;
use Modules\BarberAffiliation\Models\BarberAffiliationModel;
use Modules\BarberAffiliation\ValuesObjects\AcceptAffiliationResult;
use Modules\Brand\Services\BrandStaffingGuard;

final class AcceptAffiliationEloquentResolver
{
    public function __construct(
        private readonly StatusChangeLogger $statusChangeLogger,
        private readonly BrandStaffingGuard $staffingGuard,
    ) {}

    public function resolve(AcceptAffiliationCommand $command): AcceptAffiliationResult
    {
        return DB::transaction(function () use ($command): AcceptAffiliationResult {
            $affiliation = BarberAffiliationModel::findOrFail($command->affiliationId);

            if ($affiliation->status !== AffiliationStatus::Pending) {
                return AcceptAffiliationResult::invalidStatus();
            }

            match ($affiliation->affiliable_type) {
                AffiliableType::Branch => $this->staffingGuard->ensureBranchAcceptsBarbers($affiliation->affiliable_id),
                AffiliableType::Brand => $this->staffingGuard->ensureBrandAcceptsBarbers($affiliation->affiliable_id),
            };

            $fromStatus = $affiliation->status;
            $affiliation->update([
                'status' => AffiliationStatus::Active,
                'accepted_at' => now(),
            ]);

            $this->statusChangeLogger->log(
                StatusChangeSubjectTypeEnum::Affiliation,
                (string) $affiliation->id,
                $fromStatus->value,
                AffiliationStatus::Active->value,
                StatusChangeActorTypeEnum::Barber,
                $command->barberId,
            );

            return AcceptAffiliationResult::success($affiliation);
        });
    }
}
