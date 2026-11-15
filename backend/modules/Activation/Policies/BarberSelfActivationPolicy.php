<?php

declare(strict_types=1);

namespace Modules\Activation\Policies;

use Modules\Activation\Enums\ActivableTypeEnum;
use Modules\Activation\Enums\ActivationStatusEnum;
use Modules\Activation\Models\ActivationLogModel;
use Modules\Barber\Models\BarberModel;

/**
 * BG-3: a barber may switch their own account on only when the last switch-off was not made by an admin
 * (an admin's log row carries `activated_by_id`; a self or manager switch-off leaves it empty).
 */
final class BarberSelfActivationPolicy
{
    public const string ABILITY = 'activation.barber.self-activate';

    public function activate(BarberModel $actor, BarberModel $target): bool
    {
        if ($actor->getKey() !== $target->getKey()) {
            return false;
        }

        $latest = ActivationLogModel::query()
            ->where('activable_id', $target->getKey())
            ->where('activable_type', ActivableTypeEnum::Barber)
            ->orderByDesc('activated_at')
            ->orderByDesc('created_at')
            ->first();

        return ! ($latest?->status === ActivationStatusEnum::Disabled && $latest->activated_by_id !== null);
    }
}
