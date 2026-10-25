<?php

declare(strict_types=1);

namespace Modules\BarberAffiliation\Eloquent\Resolvers\Shared;

use Modules\BarberAffiliation\CQRS\Command\Shared\TerminateAffiliationCommand;
use Modules\BarberAffiliation\Enums\AffiliableType;
use Modules\BarberAffiliation\Enums\AffiliationStatus;
use Modules\BarberAffiliation\Models\BarberAffiliationModel;
use Modules\BarberAffiliation\ValuesObjects\TerminateAffiliationResult;
use Modules\Chair\Models\ChairModel;

final class TerminateAffiliationEloquentResolver
{
    public function resolve(TerminateAffiliationCommand $command): TerminateAffiliationResult
    {
        $affiliation = BarberAffiliationModel::findOrFail($command->affiliationId);

        if ($affiliation->status !== AffiliationStatus::Active) {
            return TerminateAffiliationResult::invalidStatus();
        }

        $affiliation->update([
            'status' => AffiliationStatus::Terminated,
            'terminated_at' => now(),
        ]);

        if ($affiliation->affiliable_type === AffiliableType::Branch) {
            ChairModel::where('branch_id', $affiliation->affiliable_id)
                ->where('barber_id', $affiliation->barber_id)
                ->update(['barber_id' => null]);
        }

        return TerminateAffiliationResult::success($affiliation);
    }
}
