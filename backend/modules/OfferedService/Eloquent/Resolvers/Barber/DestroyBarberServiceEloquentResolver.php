<?php

declare(strict_types=1);

namespace Modules\OfferedService\Eloquent\Resolvers\Barber;

use Modules\OfferedService\CQRS\Command\Barber\DestroyBarberServiceCommand;
use Modules\OfferedService\Models\OfferedServiceModel;

final class DestroyBarberServiceEloquentResolver
{
    public function resolve(DestroyBarberServiceCommand $command): void
    {
        OfferedServiceModel::query()
            ->whereKey($command->serviceId)
            ->where('serviceable_type', 'barber')
            ->where('serviceable_id', $command->barberId)
            ->firstOrFail()
            ->delete();
    }
}
