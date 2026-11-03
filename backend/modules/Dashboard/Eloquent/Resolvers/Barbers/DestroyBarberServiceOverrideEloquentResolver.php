<?php

declare(strict_types=1);

namespace Modules\Dashboard\Eloquent\Resolvers\Barbers;

use Modules\Dashboard\CQRS\Command\DestroyBarberServiceOverrideCommand;
use Modules\OfferedService\Enums\ServiceableTypeEnum;
use Modules\OfferedService\Models\BarberServiceOverrideModel;
use Modules\OfferedService\Models\OfferedServiceModel;

final class DestroyBarberServiceOverrideEloquentResolver
{
    public function resolve(DestroyBarberServiceOverrideCommand $command): void
    {
        $service = OfferedServiceModel::query()
            ->whereKey($command->serviceId)
            ->where('serviceable_type', ServiceableTypeEnum::Barber)
            ->where('serviceable_id', $command->barberId)
            ->firstOrFail();

        BarberServiceOverrideModel::query()
            ->where('offered_service_id', $service->getKey())
            ->where('brand_id', $command->brandId)
            ->delete();
    }
}
