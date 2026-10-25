<?php

declare(strict_types=1);

namespace Modules\OfferedService\Eloquent\Resolvers\Barber;

use Modules\OfferedService\CQRS\Command\Barber\StoreBarberServiceCommand;
use Modules\OfferedService\Models\OfferedServiceModel;

final class StoreBarberServiceEloquentResolver
{
    public function resolve(StoreBarberServiceCommand $command): OfferedServiceModel
    {
        return OfferedServiceModel::query()->create([
            ...$command->attributes,
            'serviceable_id' => $command->barberId,
            'serviceable_type' => 'barber',
        ]);
    }
}
