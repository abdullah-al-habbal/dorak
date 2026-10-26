<?php

declare(strict_types=1);

namespace Modules\BarberAffiliation\Eloquent\Resolvers\Shared;

use Illuminate\Support\Facades\DB;
use Modules\Audit\Enums\StatusChangeActorTypeEnum;
use Modules\Audit\Enums\StatusChangeSubjectTypeEnum;
use Modules\Audit\Services\StatusChangeLogger;
use Modules\BarberAffiliation\CQRS\Command\Shared\TerminateAffiliationCommand;
use Modules\BarberAffiliation\Enums\AffiliableType;
use Modules\BarberAffiliation\Enums\AffiliationStatus;
use Modules\BarberAffiliation\Models\BarberAffiliationModel;
use Modules\BarberAffiliation\ValuesObjects\TerminateAffiliationResult;
use Modules\Chair\Models\ChairModel;

final class TerminateAffiliationEloquentResolver
{
    public function __construct(private readonly StatusChangeLogger $statusChangeLogger) {}

    public function resolve(TerminateAffiliationCommand $command): TerminateAffiliationResult
    {
        return DB::transaction(function () use ($command): TerminateAffiliationResult {
            $affiliation = BarberAffiliationModel::findOrFail($command->affiliationId);

            if ($affiliation->status !== AffiliationStatus::Active) {
                return TerminateAffiliationResult::invalidStatus();
            }

            $fromStatus = $affiliation->status;
            $affiliation->update([
                'status' => AffiliationStatus::Terminated,
                'terminated_at' => now(),
            ]);

            if ($affiliation->affiliable_type === AffiliableType::Branch) {
                ChairModel::where('branch_id', $affiliation->affiliable_id)
                    ->where('barber_id', $affiliation->barber_id)
                    ->update(['barber_id' => null]);
            }

            $this->statusChangeLogger->log(
                StatusChangeSubjectTypeEnum::Affiliation,
                (string) $affiliation->id,
                $fromStatus->value,
                AffiliationStatus::Terminated->value,
                StatusChangeActorTypeEnum::from($command->actorType),
                $command->actorId,
            );

            return TerminateAffiliationResult::success($affiliation);
        });
    }
}
