<?php

declare(strict_types=1);

namespace Modules\OfferedService\Handlers\Barber;

use Modules\OfferedService\CQRS\Command\Barber\StoreBarberServiceCommand;
use Modules\OfferedService\Eloquent\Resolvers\Barber\StoreBarberServiceEloquentResolver;
use Modules\OfferedService\Models\OfferedServiceModel;

final readonly class StoreBarberServiceHandler
{
    public function __construct(private StoreBarberServiceEloquentResolver $resolver) {}

    public function handle(StoreBarberServiceCommand $command): OfferedServiceModel
    {
        return $this->resolver->resolve($command);
    }
}
