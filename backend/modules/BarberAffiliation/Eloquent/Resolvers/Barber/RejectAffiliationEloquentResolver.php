<?php

declare(strict_types=1);

namespace Modules\BarberAffiliation\Eloquent\Resolvers\Barber;

use Illuminate\Support\Facades\DB;
use Modules\Audit\Enums\StatusChangeActorTypeEnum;
use Modules\Audit\Enums\StatusChangeSubjectTypeEnum;
use Modules\Audit\Services\StatusChangeLogger;
use Modules\BarberAffiliation\CQRS\Command\Barber\RejectAffiliationCommand;
use Modules\BarberAffiliation\Enums\AffiliationStatus;
use Modules\BarberAffiliation\Models\BarberAffiliationModel;
use Modules\BarberAffiliation\ValuesObjects\RejectAffiliationResult;

final class RejectAffiliationEloquentResolver
{
    public function __construct(private readonly StatusChangeLogger $statusChangeLogger) {}

    public function resolve(RejectAffiliationCommand $command): RejectAffiliationResult
    {
        return DB::transaction(function () use ($command): RejectAffiliationResult {
            $affiliation = BarberAffiliationModel::query()->lockForUpdate()->findOrFail($command->affiliationId);

            if ($affiliation->status !== AffiliationStatus::Pending) {
                return RejectAffiliationResult::invalidStatus();
            }

            $fromStatus = $affiliation->status;
            $affiliation->update([
                'status' => AffiliationStatus::Rejected,
            ]);

            $this->statusChangeLogger->log(
                StatusChangeSubjectTypeEnum::Affiliation,
                (string) $affiliation->id,
                $fromStatus->value,
                AffiliationStatus::Rejected->value,
                StatusChangeActorTypeEnum::Barber,
                $command->barberId,
            );

            return RejectAffiliationResult::success($affiliation);
        });
    }
}
