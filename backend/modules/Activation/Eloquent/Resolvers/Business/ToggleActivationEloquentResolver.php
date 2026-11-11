<?php

declare(strict_types=1);

namespace Modules\Activation\Eloquent\Resolvers\Business;

use Illuminate\Database\Eloquent\Model;
use Modules\Activation\CQRS\Command\Business\ToggleActivationCommand;
use Modules\Activation\Enums\ActivationStatusEnum;
use Modules\Activation\Models\ActivationLogModel;

final class ToggleActivationEloquentResolver
{
    public function resolve(ToggleActivationCommand $command): ActivationLogModel
    {
        $activableClass = $command->activableType->modelClass();

        /** @var Model $activable */
        $activable = $activableClass::query()->findOrFail($command->activableId);

        return ActivationLogModel::create([
            'activable_id' => $activable->getKey(),
            'activable_type' => $command->activableType,
            'status' => $command->activate ? ActivationStatusEnum::Enabled : ActivationStatusEnum::Disabled,
            'reason' => $command->reason,
            'activated_by_id' => $command->activatedById,
            'activated_at' => now(),
        ]);
    }
}
