<?php

declare(strict_types=1);

namespace Modules\BarberAffiliation\Eloquent\Resolvers\Barber;

use Illuminate\Support\Facades\DB;
use Modules\Audit\Enums\StatusChangeActorTypeEnum;
use Modules\Audit\Enums\StatusChangeSubjectTypeEnum;
use Modules\Audit\Services\StatusChangeLogger;
use Modules\Barber\Models\BarberModel;
use Modules\BarberAffiliation\CQRS\Command\Barber\CreateAffiliationCommand;
use Modules\BarberAffiliation\Enums\AffiliationInitiatorTypeEnum;
use Modules\BarberAffiliation\Enums\AffiliationStatus;
use Modules\BarberAffiliation\Models\BarberAffiliationModel;

final class CreateAffiliationEloquentResolver
{
    public function __construct(private readonly StatusChangeLogger $statusChangeLogger) {}

    public function resolve(CreateAffiliationCommand $command): BarberAffiliationModel
    {
        return DB::transaction(function () use ($command): BarberAffiliationModel {
            $barber = BarberModel::findOrFail($command->barberId);

            $existing = BarberAffiliationModel::where('barber_id', $barber->id)
                ->where('affiliable_id', $command->affiliableId)
                ->where('affiliable_type', $command->affiliableType)
                ->whereIn('status', [AffiliationStatus::Pending, AffiliationStatus::Active])
                ->exists();

            if ($existing) {
                throw new BarberAlreadyAffiliatedException;
            }

            $affiliation = BarberAffiliationModel::create([
                'barber_id' => $barber->id,
                'initiated_by_type' => AffiliationInitiatorTypeEnum::Barber,
                'initiated_by_id' => $barber->id,
                'affiliable_id' => $command->affiliableId,
                'affiliable_type' => $command->affiliableType,
                'commission_rate' => $command->commissionRate,
                'status' => AffiliationStatus::Pending,
                'invited_at' => now(),
            ]);

            $this->statusChangeLogger->log(
                StatusChangeSubjectTypeEnum::Affiliation,
                (string) $affiliation->id,
                null,
                AffiliationStatus::Pending->value,
                StatusChangeActorTypeEnum::Barber,
                (string) $barber->id,
            );

            return $affiliation;
        });
    }
}
