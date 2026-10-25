<?php

declare(strict_types=1);

namespace Modules\OfferedService\Eloquent\Resolvers\Barber;

use Modules\OfferedService\CQRS\Command\Barber\UpdateBarberServiceCommand;
use Modules\OfferedService\Models\OfferedServiceModel;

final class UpdateBarberServiceEloquentResolver
{
    public function resolve(UpdateBarberServiceCommand $command): OfferedServiceModel
    {
        $service = OfferedServiceModel::query()
            ->whereKey($command->serviceId)
            ->where('serviceable_type', 'barber')
            ->where('serviceable_id', $command->barberId)
            ->firstOrFail();

        $service->update($command->attributes);

        return $service->refresh();
    }
}
