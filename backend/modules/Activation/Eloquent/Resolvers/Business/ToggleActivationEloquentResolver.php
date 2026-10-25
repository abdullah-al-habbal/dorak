<?php

declare(strict_types=1);

namespace Modules\Activation\Eloquent\Resolvers\Business;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\Relation;
use Modules\Activation\CQRS\Command\Business\ToggleActivationCommand;
use Modules\Activation\Enums\ActivationStatusEnum;
use Modules\Activation\Models\ActivationLogModel;

final class ToggleActivationEloquentResolver
{
    public function resolve(ToggleActivationCommand $command): ActivationLogModel
    {
        $activableClass = Relation::getMorphedModel($command->activableType) ?? $command->activableType;

        /** @var Model $activable */
        $activable = $activableClass::query()->findOrFail($command->activableId);

        return ActivationLogModel::create([
            'activable_id' => $activable->getKey(),
            'activable_type' => $activable->getMorphClass(),
            'status' => $command->activate ? ActivationStatusEnum::Enabled : ActivationStatusEnum::Disabled,
            'reason' => $command->reason,
            'activated_at' => now(),
        ]);
    }
}
