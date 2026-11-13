<?php

declare(strict_types=1);

namespace Modules\BarberAffiliation\Eloquent\Resolvers\Barber;

use Illuminate\Support\Facades\DB;
use Illuminate\Validation\ValidationException;
use Modules\Audit\Enums\StatusChangeActorTypeEnum;
use Modules\Audit\Enums\StatusChangeSubjectTypeEnum;
use Modules\Audit\Services\StatusChangeLogger;
use Modules\Barber\Models\BarberModel;
use Modules\BarberAffiliation\CQRS\Command\Barber\CreateAffiliationCommand;
use Modules\BarberAffiliation\Enums\AffiliableType;
use Modules\BarberAffiliation\Enums\AffiliationInitiatorTypeEnum;
use Modules\BarberAffiliation\Enums\AffiliationStatus;
use Modules\BarberAffiliation\Models\BarberAffiliationModel;
use Modules\Brand\Services\BrandStaffingGuard;

final class CreateAffiliationEloquentResolver
{
    public function __construct(
        private readonly StatusChangeLogger $statusChangeLogger,
        private readonly BrandStaffingGuard $staffingGuard,
    ) {}

    public function resolve(CreateAffiliationCommand $command): BarberAffiliationModel
    {
        return DB::transaction(function () use ($command): BarberAffiliationModel {
            if ($command->affiliableType !== AffiliableType::Branch) {
                throw ValidationException::withMessages(['affiliable_type' => [__('barberaffiliation::messages.brand_level_not_supported')]]);
            }

            // Barber row first: it serialises this barber's requests, so the duplicate check below cannot race.
            $barber = BarberModel::query()->lockForUpdate()->findOrFail($command->barberId);

            $this->staffingGuard->ensureBranchAcceptsBarbers($command->affiliableId);

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
                'commission_percent' => $command->commissionPercent,
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
