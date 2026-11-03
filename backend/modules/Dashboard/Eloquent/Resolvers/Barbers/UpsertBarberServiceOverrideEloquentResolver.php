<?php

declare(strict_types=1);

namespace Modules\Dashboard\Eloquent\Resolvers\Barbers;

use Modules\Dashboard\CQRS\Command\UpsertBarberServiceOverrideCommand;
use Modules\OfferedService\Enums\ServiceableTypeEnum;
use Modules\OfferedService\Models\BarberServiceOverrideModel;
use Modules\OfferedService\Models\OfferedServiceModel;
use Modules\OfferedService\Services\EffectiveServiceTerms;

final class UpsertBarberServiceOverrideEloquentResolver
{
    public function __construct(private readonly EffectiveServiceTerms $serviceTerms) {}

    public function resolve(UpsertBarberServiceOverrideCommand $command): OfferedServiceModel
    {
        $service = OfferedServiceModel::query()
            ->whereKey($command->serviceId)
            ->where('serviceable_type', ServiceableTypeEnum::Barber)
            ->where('serviceable_id', $command->barberId)
            ->firstOrFail();

        BarberServiceOverrideModel::query()->updateOrCreate(
            ['offered_service_id' => $service->getKey(), 'brand_id' => $command->brandId],
            ['price_amount_minor' => $command->priceAmountMinor, 'duration_minutes' => $command->durationMinutes],
        );

        $this->serviceTerms->attach([$service], $command->brandId);

        return $service;
    }
}
