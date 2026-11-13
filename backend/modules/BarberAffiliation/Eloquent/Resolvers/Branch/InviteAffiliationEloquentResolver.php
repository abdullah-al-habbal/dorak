<?php

declare(strict_types=1);

namespace Modules\BarberAffiliation\Eloquent\Resolvers\Branch;

use Illuminate\Support\Facades\DB;
use Modules\Audit\Enums\StatusChangeActorTypeEnum;
use Modules\Audit\Enums\StatusChangeSubjectTypeEnum;
use Modules\Audit\Services\StatusChangeLogger;
use Modules\Barber\Models\BarberModel;
use Modules\BarberAffiliation\CQRS\Command\Branch\InviteAffiliationCommand;
use Modules\BarberAffiliation\Eloquent\Resolvers\Barber\BarberAlreadyAffiliatedException;
use Modules\BarberAffiliation\Enums\AffiliableType;
use Modules\BarberAffiliation\Enums\AffiliationInitiatorTypeEnum;
use Modules\BarberAffiliation\Enums\AffiliationStatus;
use Modules\BarberAffiliation\Models\BarberAffiliationModel;
use Modules\Branch\Models\BranchModel;
use Modules\Brand\Services\BrandStaffingGuard;

final class InviteAffiliationEloquentResolver
{
    public function __construct(
        private readonly StatusChangeLogger $statusChangeLogger,
        private readonly BrandStaffingGuard $staffingGuard,
    ) {}

    public function resolve(InviteAffiliationCommand $command): BarberAffiliationModel
    {
        return DB::transaction(function () use ($command): BarberAffiliationModel {
            $branch = BranchModel::findOrFail($command->branchId);
            $barber = BarberModel::findOrFail($command->barberId);
            $this->staffingGuard->ensureBranchAcceptsBarbers($branch->id);

            $existing = BarberAffiliationModel::where('barber_id', $barber->id)
                ->where('affiliable_id', $branch->id)
                ->where('affiliable_type', AffiliableType::Branch)
                ->whereIn('status', [AffiliationStatus::Pending, AffiliationStatus::Active])
                ->exists();

            if ($existing) {
                throw new BarberAlreadyAffiliatedException;
            }

            $affiliation = BarberAffiliationModel::create([
                'barber_id' => $barber->id,
                'initiated_by_type' => AffiliationInitiatorTypeEnum::Branch,
                'initiated_by_id' => $branch->id,
                'affiliable_id' => $branch->id,
                'affiliable_type' => AffiliableType::Branch,
                'commission_percent' => $command->commissionPercent,
                'status' => AffiliationStatus::Pending,
                'invited_at' => now(),
            ]);

            $this->statusChangeLogger->log(
                StatusChangeSubjectTypeEnum::Affiliation,
                (string) $affiliation->id,
                null,
                AffiliationStatus::Pending->value,
                $command->actor?->type ?? StatusChangeActorTypeEnum::Branch,
                $command->actor?->id ?? (string) $branch->id,
            );

            return $affiliation;
        });
    }
}
